import { api, HydrateClient } from "~/trpc/server";

import UploadButtonTest from "./_components/UploadButton";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-2 text-black">
            {/* <p className="text-2xl">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p> */}

            <UploadButtonTest />
          </div>

          {/* <LatestPost /> */}
        </div>
      </main>
    </HydrateClient>
  );
}
