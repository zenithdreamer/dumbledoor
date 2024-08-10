import DoorWithScanner from "./_components/door";
import MovableKeycard from "./_components/keycard";

export default function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below

  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <DoorWithScanner />
        <MovableKeycard
          name="John Doe"
          role="SCP Manager"
          id="65011353"
          level={3}
        />
      </div>
    </main>
  );
}
