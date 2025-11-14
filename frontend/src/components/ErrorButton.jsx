import * as Sentry from '@sentry/react';

function ErrorButton() {
  return (
    <button
      className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
      onClick={() => {
        // Send a log before throwing the error
        Sentry.logger.info('User triggered test error', {
          action: 'test_error_button_click',
        });
        // Send a test metric before throwing the error
        Sentry.metrics.count('test_counter', 1);
        throw new Error('This is your first error!');
      }}
    >
      Break the world
    </button>
  );
}

export default ErrorButton;