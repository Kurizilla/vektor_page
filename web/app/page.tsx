import { Footer } from "../components/Footer";
import { SmartRecs } from "../components/SmartRecs";

export default function Page() {
  return (
    <main className="min-h-screen px-0 flex flex-col">
      <div className="flex-1 flex">
        <SmartRecs />
      </div>
      <Footer />
    </main>
  );
}
