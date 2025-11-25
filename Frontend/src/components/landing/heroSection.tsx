"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const Hero = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  const banners = ["/img/banners/banner1.webp", 
                    "/img/banners/banner2.webp", 
                    "/img/banners/banner3.webp"];

  return (
    <div className="relative w-full">
      <Carousel
        plugins={[plugin.current]}
        opts={{
          loop: true,
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {banners.map((src, i) => (
            <CarouselItem className="pl-0" key={src}>
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                loading="lazy"
                className="w-full h-auto object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default Hero;
