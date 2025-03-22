import React from "react";
import { Card, CardContent } from "../ui/card";

interface AdvertisingCardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  onClick?: () => void;
}

const AdvertisingCard = ({
  title = "Special Offer",
  description = "Check out this amazing deal just for you!",
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  ctaText = "Learn More",
  onClick = () => console.log("Ad clicked"),
}: AdvertisingCardProps) => {
  return (
    <Card className="overflow-hidden mb-4 border border-pink-200 hover:shadow-md transition-shadow duration-300">
      <div className="relative h-32 w-full">
        <img
          src={imageUrl}
          alt="Advertisement"
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
        <p className="text-xs text-gray-600 mt-1 mb-2">{description}</p>
        <button
          onClick={onClick}
          className="w-full bg-[#f2a2d2] hover:bg-pink-400 text-white text-xs py-1.5 px-3 rounded-md transition-colors duration-300"
        >
          {ctaText}
        </button>
      </CardContent>
    </Card>
  );
};

interface AdvertisingSectionProps {
  ads?: AdvertisingCardProps[];
}

const AdvertisingSection = ({
  ads = [
    {
      title: "Summer Sale",
      description: "Get 50% off on all summer items. Limited time offer!",
      imageUrl:
        "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400&q=80",
      ctaText: "Shop Now",
    },
    {
      title: "New Collection",
      description: "Discover our latest fashion arrivals for this season.",
      imageUrl:
        "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&q=80",
      ctaText: "View Collection",
    },
  ],
}: AdvertisingSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm w-full">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Sponsored</h2>
      {ads.map((ad, index) => (
        <AdvertisingCard key={index} {...ad} />
      ))}
    </div>
  );
};

export default AdvertisingSection;
