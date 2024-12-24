// frontend/src/components/MainContent.tsx
import { useEffect, useState } from "react";

export default function MainContent() {
    const [randomNumber, setRandomNumber] = useState<number | null>(null);

    useEffect(() => {
        setRandomNumber(Math.random());
    }, []);

    return (
        <div className="main-content">
            <p>Random Number: {randomNumber}</p>
            <h1>Trang Chủ</h1>
            <p>Chào mừng đến với dự án Next.js Hoàn Hảo</p>
        </div>
    );
}
