import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext.js';

function TestConsumer() {
  const { login, authError, user, isLoading } = useAuth();
  return (
    <div>
      {isLoading ? <span>Loading...</span> : <span>Ready</span>}
      {user ? <span>Logged in as {user.username}</span> : <span>Not logged in</span>}
      {authError && <div data-testid="auth-error-msg">{authError}</div>}
      <button onClick={() => login('wrong_user', 'wrong_pass')}>Trigger Login</button>
    </div>
  );
}

describe('AuthContext Login Failure & Error State Render Test', () => {
  it('renders login failure error message when authentication fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/api/v1/auth/me') {
        return Promise.resolve(new Response(JSON.stringify({ success: false }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }));
      }
      if (url === '/api/v1/auth/login') {
        return Promise.resolve(new Response(JSON.stringify({
          success: false,
          error: { message: 'Invalid credentials. Password verification failed.' },
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }));
      }
      return Promise.reject(new Error('Unknown URL'));
    }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Trigger Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-error-msg')).toHaveTextContent('Invalid credentials. Password verification failed.');
    });
  });
});
