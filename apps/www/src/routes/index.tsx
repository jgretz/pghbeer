import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{title: 'PghBeer'}],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold">PghBeer</h1>
      <p className="mt-4 text-lg text-gray-600">Coming soon</p>
    </div>
  );
}
