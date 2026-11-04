import fs from 'fs';
import path from 'path';
import { MigrationSafetyReport, MigrationSafetyWarning } from './safechange.types.js';

export class MigrationSafetyChecker {
  /**
   * Analyze proposed Prisma schema against current schema on disk
   */
  public static checkSchema(
    proposedSchemaContent: string,
    currentSchemaPath?: string
  ): MigrationSafetyReport {
    const warnings: MigrationSafetyWarning[] = [];
    const candidatePaths = [
      currentSchemaPath || '',
      path.resolve(process.cwd(), 'prisma/schema.prisma'),
      path.resolve(process.cwd(), 'apps/api/prisma/schema.prisma'),
      path.resolve(process.cwd(), '../../apps/api/prisma/schema.prisma'),
      path.resolve(process.cwd(), 'src/database/schema.prisma'),
      path.resolve(process.cwd(), 'apps/api/src/database/schema.prisma'),
    ].filter(Boolean);
    const diskPath = candidatePaths.find(p => fs.existsSync(p)) || '';

    let currentSchema = '';
    if (diskPath && fs.existsSync(diskPath)) {
      currentSchema = fs.readFileSync(diskPath, 'utf8');
    }

    const currentModels = this.parseModels(currentSchema);
    const proposedModels = this.parseModels(proposedSchemaContent);

    let isDestructive = false;

    // 1. Check for Deleted Models (Dropped Tables)
    currentModels.forEach((currFields, modelName) => {
      if (!proposedModels.has(modelName)) {
        isDestructive = true;
        warnings.push({
          severity: 'CRITICAL',
          model: modelName,
          change: 'DROPPED_TABLE',
          message: `Model '${modelName}' is removed. This will drop the table and destroy all associated records.`,
          safeRemediation: `If deprecating, mark fields optional first or back up data before removing the model definition.`,
        });
      }
    });

    // 2. Check for Dropped Fields
    currentModels.forEach((currFields, modelName) => {
      const propFields = proposedModels.get(modelName);
      if (propFields) {
        currFields.forEach((currType, fieldName) => {
          if (!propFields.has(fieldName)) {
            isDestructive = true;
            warnings.push({
              severity: 'CRITICAL',
              model: modelName,
              field: fieldName,
              change: 'DROPPED_COLUMN',
              message: `Field '${fieldName}' in model '${modelName}' is removed. Existing data in this column will be lost.`,
              safeRemediation: `Keep the field nullable or deprecate it in application code before dropping column.`,
            });
          }
        });
      }
    });

    // 3. Check for Non-Nullable Fields Added without Default
    proposedModels.forEach((propFields, modelName) => {
      const currFields = currentModels.get(modelName);
      if (currFields) {
        propFields.forEach((propDef, fieldName) => {
          if (!currFields.has(fieldName)) {
            // New field in existing model
            const isNullable = propDef.type.includes('?');
            const hasDefault = propDef.raw.includes('@default');
            const isId = propDef.raw.includes('@id');
            const isRelation = propDef.raw.includes('@relation');

            if (!isNullable && !hasDefault && !isId && !isRelation) {
              isDestructive = true;
              warnings.push({
                severity: 'CRITICAL',
                model: modelName,
                field: fieldName,
                change: 'NON_NULL_NO_DEFAULT',
                message: `Non-nullable field '${fieldName}' added to '${modelName}' without a @default(...) value. Applying this migration will fail on existing rows.`,
                safeRemediation: `Make the field optional (${propDef.type}?) or provide a @default(...) value.`,
              });
            }
          }
        });
      }
    });

    // 4. Calculate Safety Score
    let score = 100;
    warnings.forEach(w => {
      if (w.severity === 'CRITICAL') score -= 35;
      else if (w.severity === 'WARNING') score -= 15;
      else score -= 5;
    });
    score = Math.max(0, score);

    const summary = warnings.length === 0
      ? 'Schema change is 100% non-destructive and backward compatible.'
      : `Detected ${warnings.length} migration risk(s). ${isDestructive ? 'Destructive changes require manual intervention.' : 'Review recommended.'}`;

    return {
      isDestructive,
      score,
      warnings,
      summary,
    };
  }

  /**
   * Helper to parse Prisma models and field definitions
   */
  private static parseModels(
    content: string
  ): Map<string, Map<string, { type: string; raw: string }>> {
    const models = new Map<string, Map<string, { type: string; raw: string }>>();
    const lines = content.split('\n');

    let currentModel: string | null = null;
    let currentFields = new Map<string, { type: string; raw: string }>();

    for (const line of lines) {
      const trimmed = line.trim();

      const modelMatch = trimmed.match(/^model\s+([A-Za-z0-9_]+)\s*\{/);
      if (modelMatch) {
        currentModel = modelMatch[1];
        currentFields = new Map();
        models.set(currentModel, currentFields);
        continue;
      }

      if (trimmed === '}' && currentModel) {
        currentModel = null;
        continue;
      }

      if (currentModel && trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@@')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const fieldType = parts[1];
          currentFields.set(fieldName, { type: fieldType, raw: trimmed });
        }
      }
    }

    return models;
  }
}
