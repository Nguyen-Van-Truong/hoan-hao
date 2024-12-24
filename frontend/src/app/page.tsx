"use client";

import { useEffect, useState } from "react";

export default function Home() {
    const [randomNumber, setRandomNumber] = useState<number | null>(null);

    useEffect(() => {
        setRandomNumber(Math.random());
    }, []);

    return (
        <div>
            <p>Random Number: {randomNumber}</p>
            <h1>Trang Chủ</h1>
            <p>Chào mừng đến với dự án Next.js Hoàn Hảo</p>
        </div>
    );
}
