"use client";
import { useMemo, useState } from "react";
import UVChart from "@/app/components/UVChart";
import Image from "next/image";
import RSetaChart from "./components/RSetaChart";
import RSetaScatterChart from "./components/RSetaChart";

type DataResponseType = {
  centroids: number[];
  r_setas: {
    prota: RSeta;
    deutera: RSeta;
    trita: RSeta;
  };
};

type RSeta = {
  r: number;
  seta: number;
};


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [centroids, setCentroids] = useState<DataResponseType[]>([]);
  const [rSetaDisplayType, setRSetaDisplayType] = useState<'graph' | 'number'>('graph');
  const [sortBy, setSortBy] = useState<"prota" | "deutera" | "trita">('prota');
  const [confType, setConfType] = useState<"prota" | "deutera" | "trita">('prota');
  const [kValue, setKValue] = useState('');

  const handleUpload = async () => {
    if (!file || !kValue) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("k", kValue);
    formData.append("confType", confType);

    const res = await fetch("http://localhost:8000/uv-space", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);

    setCentroids(data.centroids);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected)); // ✅ preview
    }
  };

  const sortedCentroids = useMemo(() => {
    return [...centroids].sort((a, b) => {
      return a.r_setas[sortBy].seta - b.r_setas[sortBy].seta;
    });
  }, [centroids, sortBy]);

  const handleAnalysis = async () => {
    console.log('sortedType: ', sortBy);
    console.log('sortedCentroids: ', sortedCentroids);

    const payload = {
      r_seta_type: sortBy,
      centriods: sortedCentroids
    };

    const res = await fetch("http://localhost:8000/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload), // <= ต้องเป็น string!
    });

    const data = await res.json();
    console.log(data);
  };


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">โปรแกรมสร้างรูปภาพเพื่อคนตาบอดสี</h1>
      <div className="flex w-full gap-2">
        <div className="w-1/2 space-y-2">
          <div className="flex gap-4">
            <label htmlFor="file">อัพรูปภาพ</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="border border-neutral-300 px-4 py-1" />
          </div>
          <div className="flex gap-4">
            <label htmlFor="kValue">กำหนดค่า K</label>
            <input type="number" className="border px-4 py-1 rounded" placeholder="ค่า K" value={kValue} onChange={(e) => setKValue(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <label htmlFor="kValue">กำหนดชนิดข้อมูลเป็น</label>
            <select value={confType} onChange={(e) => setConfType(e.target.value as "prota" | "deutera" | "trita")} className="mb-4 border text-lg">
              <option value="prota">Prota</option>
              <option value="deutera">Deutera</option>
              <option value="trita">Trita</option>
            </select>
          </div>
          <button onClick={handleUpload} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
            วิเคราะห์
          </button>
        </div>
        <div className="w-1/2">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="border rounded max-w-xs shadow"
            />
          )}
        </div>
      </div>

      {centroids.length > 0 && (
        <>
          <div className="flex">
            <div className="w-1/2 mt-8">
              <h2 className="text-xl font-semibold">Centroids &rarr; r, seta</h2>
              <div>
                <p className="mb-2">เรียงข้อมูลตาม</p>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "prota" | "deutera" | "trita")} className="mb-4 border text-lg">
                  <option value="prota">Prota</option>
                  <option value="deutera">Deutera</option>
                  <option value="trita">Trita</option>
                </select>
                <div className="flex gap-x-2 mb-4">
                  <button type="button" onClick={() => setRSetaDisplayType('graph')} className="cursor-pointer px-2 py-1 bg-blue-400 hover:bg-blue-600 transition rounded">กราฟ</button>
                  <button type="button" onClick={() => setRSetaDisplayType('number')} className="cursor-pointer px-2 py-1 bg-green-400 hover:bg-green-600 transition rounded">ค่าตัวเลข</button>
                </div>
              </div>
              <div>
                {rSetaDisplayType === "number" && (
                  <ul>
                    {sortedCentroids.map((c, idx) => (
                      <li key={idx} className="mb-2">
                        <div className="font-bold">Cluster {idx + 1}:</div>
                        <div>u: {c.centroids[0].toFixed(3)}, v: {c.centroids[1].toFixed(3)}</div>
                        <div>r_prota: {c.r_setas.prota.r.toFixed(3)}, seta_prota: {c.r_setas.prota.seta.toFixed(3)}</div>
                        <div>r_deutera: {c.r_setas.deutera.r.toFixed(3)}, seta_deutera: {c.r_setas.deutera.seta.toFixed(3)}</div>
                        <div>r_trita: {c.r_setas.trita.r.toFixed(3)}, seta_trita: {c.r_setas.trita.seta.toFixed(3)}</div>
                      </li>
                    ))}
                  </ul>
                )}

                {rSetaDisplayType === "graph" && sortedCentroids.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-2">กราฟจุด (r, seta) แยกตามชนิด</h3>
                    <div className="flex flex-col gap-4">
                      <RSetaScatterChart
                        type="prota"
                        data={sortedCentroids.map((c) => c.r_setas.prota)}
                      />
                      <RSetaScatterChart
                        type="deutera"
                        data={sortedCentroids.map((c) => c.r_setas.deutera)}
                      />
                      <RSetaScatterChart
                        type="trita"
                        data={sortedCentroids.map((c) => c.r_setas.trita)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-1/2 pt-4 pl-8">
              <h3 className="font-semibold text-2xl underline mb-2">กราฟจุด Centroids</h3>
              <UVChart centroids={centroids.map(c => c.centroids)} />
              <h3 className="font-semibold text-2xl underline mb-2">นำค่ามาเทียบกับกราฟด้านล่าง</h3>
              <Image src={'/BE0Aj.png'} width={400} height={400} alt="เทียบ" />
            </div>

          </div>
          <hr className="mb-4 mt-8" />
          <div className="w-full mt-4 flex justify-center">
            <button onClick={handleAnalysis} className="px-4 py-2 w-[100px] bg-red-500 rounded text-white">วินิจฉัย</button>
          </div>
        </>
      )}
    </div>
  );
}
