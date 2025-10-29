"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

const Hero = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false }) // autoplay cada 4 segundos
  )

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
          <CarouselItem className="pl-0">
            <img
              src="/img/banners/banner1.webp"
              alt="Slide 1"
              loading="lazy"
              className="w-full h-auto object-cover"
            />
          </CarouselItem>
          <CarouselItem className="pl-0">
            <img
              src="/img/banners/banner2.webp"
              alt="Slide 2"
              loading="lazy"
              className="w-full h-auto object-cover"
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export default Hero
