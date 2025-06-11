"use client";
import { useMemo, useState } from "react";
import UVChart from "@/app/components/UVChart";
import Image from "next/image";
import RSetaChart from "./components/RSetaChart";
import RSetaScatterChart from "./components/RSetaChart";
import Link from "next/link";

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

type EachImageData = {
  delta_e_avg: number;
  delta_e_max: number;
  delta_e_min: number;
  delta_e_std: number;
  colorfulness: number;
}

type ImageFinalData = {
  image1: EachImageData,
  image2: EachImageData,
  ssim: number,
  tSNR: number;
  msg: string
}


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [filterdOriginalImgFile, setFilterdOriginalImgFile] = useState<File | null>(null);
  const [filterdRemappedImgFile, setFilterdRemappedImgFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [img1Url, setImg1Url] = useState<string | null>(null);
  const [img2Url, setImg2Url] = useState<string | null>(null);
  const [centroids, setCentroids] = useState<DataResponseType[]>([]);
  const [rSetaDisplayType, setRSetaDisplayType] = useState<'graph' | 'number'>('graph');
  const [sortBy, setSortBy] = useState<"prota" | "deutera" | "trita">('prota');
  const [confType, setConfType] = useState<"prota" | "deutera" | "trita">('prota');
  const [kValue, setKValue] = useState('');
  const [mValue, setMValue] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [originalPixels, setOriginalPixels] = useState<any[]>([]);
  const [imageFinalData, setImageFinalData] = useState<ImageFinalData | null>(null);

  const handleAnalysis = async () => {
    console.log('sortedType: ', sortBy);
    console.log('sortedCentroids: ', sortedCentroids);

    const payload = {
      r_seta_type: sortBy,
      centriods: sortedCentroids,
      m_body_value: parseFloat(mValue),
      original_pixels: originalPixels
    };

    const res = await fetch("http://localhost:8000/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(data);

    // Set the processed image URL
    if (data.processedImage) {
      setProcessedImageUrl(`data:image/png;base64,${data.processedImage}`);
    }
  };

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
    setOriginalPixels(data.array_of_pixels);
  };

  const handleDeltaEUpload = async () => {
    if (!filterdOriginalImgFile || !filterdRemappedImgFile) return;

    const formData = new FormData();
    formData.append("img1", filterdOriginalImgFile);
    formData.append("img2", filterdRemappedImgFile);

    const res = await fetch("http://localhost:8000/findDeltaE", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);

    setImageFinalData(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected)); // ✅ preview
    }
  };

  const handleFilteredOriginalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFilterdOriginalImgFile(selected);
      setImg1Url(URL.createObjectURL(selected)); // ✅ preview
    }
  };

  const handleFilteredRemappedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFilterdRemappedImgFile(selected);
      setImg2Url(URL.createObjectURL(selected)); // ✅ preview
    }
  };

  const sortedCentroids = useMemo(() => {
    return [...centroids].sort((a, b) => {
      return a.r_setas[sortBy].seta - b.r_setas[sortBy].seta;
    });
  }, [centroids, sortBy]);

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:8000/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: (processedImageUrl as string).split(',')[1] // Remove the data:image/jpeg;base64, prefix
        })
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create a blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sortBy + '_processed_image.jpg';
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      // You might want to show an error message to the user here
    }
  };


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">โปรแกรมสร้างรูปภาพเพื่อคนตาบอดสี</h1>
      <div className="flex flex-col md:flex-row w-full gap-2">
        <div className="md:w-1/2 space-y-2">
          <div className="flex gap-4 ">
            <label htmlFor="file">อัพรูปภาพ</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="border border-neutral-300 px-4 py-1 w-full" />
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
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 mt-8">
              <h2 className="text-xl font-semibold">Centroids &rarr; r, seta</h2>
              <div>
                <p className="mb-2">เรียงข้อมูลตาม</p>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "prota" | "deutera" | "trita")} className="mb-4 border text-lg">
                  <option value="prota">Prota</option>
                  <option value="deutera">Deutera</option>
                  <option value="trita">Trita</option>
                </select>
                <p className="mb-2">ค่า M</p>
                <input type="text" className="border px-4 py-1 rounded" placeholder="ค่า M" value={mValue} onChange={(e) => setMValue(e.target.value)} />
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
            <div className="md:w-1/2 pt-4 md:pl-8">
              <h3 className="font-semibold text-2xl underline mb-2">กราฟจุด Centroids</h3>
              <UVChart centroids={centroids.map(c => c.centroids)} />
              <h3 className="font-semibold text-2xl underline mb-2">นำค่ามาเทียบกับกราฟด้านล่าง</h3>
              <Image src={'/BE0Aj.png'} width={400} height={400} alt="เทียบ" />
            </div>

          </div>
          <hr className="mb-4 mt-8" />
          <div className="w-full mt-4 flex flex-col items-center text-center">
            <button onClick={handleAnalysis} className="px-4 py-2 w-[100px] bg-red-500 hover:bg-red-600 cursor-pointer rounded text-white">วินิจฉัย</button>
            {/* Display processed image */}
            {processedImageUrl && (
              <div className="container mx-auto p-4 flex flex-col items-center">
                <div className="mt-4">
                  <h3 className="font-semibold text-xl mb-2">รูปภาพที่ประมวลผลแล้ว</h3>
                  <img
                    src={processedImageUrl}
                    alt="Processed Image"
                    className="max-w-full h-auto border rounded shadow-lg"
                  />
                  <button
                    onClick={handleDownload}
                    className="bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 rounded mt-4 transition-colors duration-200"
                  >
                    ดาวน์โหลดรูปภาพ
                  </button>
                </div>
              </div>
            )}
          </div>
          <hr className="my-2" />
          <section className="px-0 md:px-8">
            <h1 className="font-bold text-xl">ส่วนที่ 2</h1>
            <p className="text-lg">ทดสอบค่า Delta e</p>
            <p className="">
              โปรดนำภาพของคุณทั้งสองภาพ (ภาพต้นฉบับ และ ภาพที่ได้จากการ Remap) ไปใส่ฟิลเตอร์ตาบอดสีที่นี่&nbsp;
              <Link target="_blank" href={'https://daltonlens.org/colorblindness-simulator'} className="underline text-purple-800">https://daltonlens.org/colorblindness-simulator</Link>
            </p>

            <div className="flex flex-col md:flex-row md:items-center mt-4 gap-x-4 space-y-4">
              <div className="md:w-1/2 w-full">
                <p className="text-lg font-medium">ภาพต้นฉบับที่ใส่ฟิลเตอร์แล้ว</p>
                <input type="file" accept="image/*" onChange={handleFilteredOriginalImageChange} className="border border-neutral-300 px-4 py-1 w-full" />
                {img1Url && (
                  <img
                    src={img1Url}
                    alt="preview"
                    className="border rounded max-w-xs shadow mt-4"
                  />
                )}
                {imageFinalData && (
                  <div className="mt-4">
                    <p>ค่าเฉลี่ย ΔE: {imageFinalData.image1.delta_e_avg}</p>
                    <p>ค่า ΔE ที่มากที่สุด: {imageFinalData.image1.delta_e_max}</p>
                    <p>ค่า ΔE ที่น้อยที่สุด: {imageFinalData.image1.delta_e_min}</p>
                    <p>ส่วนเบี่ยงเบนมาตรฐาน: {imageFinalData.image1.delta_e_std}</p>
                    <p>ค่า Colorfulness Metric: {imageFinalData.image1.colorfulness}</p>
                  </div>
                )}
              </div>
              <div className="md:w-1/2 w-full">
                <p className="text-lg font-medium">ภาพ remap ที่ใส่ฟิลเตอร์แล้ว</p>
                <input type="file" accept="image/*" onChange={handleFilteredRemappedImageChange} className="border border-neutral-300 px-4 py-1 w-full" />
                {img2Url && (
                  <img
                    src={img2Url}
                    alt="preview"
                    className="border rounded max-w-xs shadow mt-4"
                  />
                )}
                {imageFinalData && (
                  <div className="mt-4">
                    <p>ค่าเฉลี่ย ΔE: {imageFinalData.image2.delta_e_avg}</p>
                    <p>ค่า ΔE ที่มากที่สุด: {imageFinalData.image2.delta_e_max}</p>
                    <p>ค่า ΔE ที่น้อยที่สุด: {imageFinalData.image2.delta_e_min}</p>
                    <p>ส่วนเบี่ยงเบนมาตรฐาน: {imageFinalData.image2.delta_e_std}</p>
                    <p>ค่า Colorfulness Metric: {imageFinalData.image2.colorfulness}</p>
                  </div>
                )}
              </div>
            </div>
            {imageFinalData && <p className="text-center text-xl mt-8">ค่า SSIM: {imageFinalData.ssim}</p>}
            {imageFinalData && <p className="text-center text-xl">ค่า tSNR: {imageFinalData.tSNR}</p>}
            <div className="flex flex-col items-center">
              <button onClick={handleDeltaEUpload} className="mt-4 px-4 py-2 bg-purple-300 hover:bg-purple-500 cursor-pointer transition rounded-lg">เทียบหาค่า delta e</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
