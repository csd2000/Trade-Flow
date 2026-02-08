import { useEffect, useState } from "react";

type Section = {
  id: string;
  title: string;
  description: string;
  features: string[];
  data_source: string;
};

export default function ConsolidatedDashboard() {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetch("/consolidated_crypto_training_system.json")
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">🧩 Crypto Strategy Hub</h1>
      <p className="mb-6 text-lg text-gray-700">Explore, earn, and exit DeFi confidently with everything in one place.</p>

      {sections.map((section) => (
        <div key={section.id} className="mb-8 border rounded-xl p-6 shadow bg-white">
          <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
          <p className="text-gray-600 mb-4">{section.description}</p>

          <ul className="list-disc ml-5 mb-4 text-sm text-gray-800">
            {section.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>

          <a
            href={`/${section.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            Go to {section.title.replace(/[^a-zA-Z]/g, "")}
          </a>
        </div>
      ))}
    </div>
  );
}