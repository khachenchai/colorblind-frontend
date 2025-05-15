"use client";
import { useState } from "react";
import UVChart from "@/app/components/UVChart";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [centroids, setCentroids] = useState([]);
  const [kValue, setKValue] = useState('')

  const handleUpload = async () => {
    if (!file) return;
    // const k = parseInt(kValue)
    const formData = new FormData();
    formData.append("image", file);
    formData.append("k", kValue);

    const res = await fetch("http://localhost:8000/uv-space", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setCentroids(data.centroids);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">โปรแกรมสร้างรูปภาพเพื่อคนตาบอดสี</h1>
      <div className="flex flex-col w-1/2 space-y-2">
        <div className="flex gap-4">
          <label htmlFor="file" className="">อัพรูปภาพ</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="border border-neutral-300 px-4 py-1" />
        </div>
        <div className="flex gap-4">
          <label htmlFor="file" className="">กำหนดค่า K</label><input type="number" className="border px-4 py-1 rounded" placeholder="ค่า K" value={kValue} onChange={(e) => setKValue(e.target.value)} />
        </div>
        <button onClick={handleUpload} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
          Analyze
        </button>
      </div>

      {centroids.length > 0 && (
        <div className="flex">
          <div className="w-1/2">
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Centroids (u, v)</h2>
              <ul>
                {centroids.map((c, idx) => (
                  <li key={idx}>
                    Cluster {idx + 1}: u={(c[0] as number).toFixed(3)}, v={(c[1] as number).toFixed(3)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-1/2 pt-4">
            <h3 className="font-semibold text-2xl underline mb-2">กราฟจุด Centroids</h3>
            <UVChart centroids={centroids} />
            <h3 className="font-semibold text-2xl underline mb-2">นำค่ามาเทียบกับกราฟด้านล่าง</h3>
            <Image src={'/BE0Aj.png'} width={400} height={400} alt="เทียบ" />
          </div>
        </div>
      )}
    </div>
  );
}
