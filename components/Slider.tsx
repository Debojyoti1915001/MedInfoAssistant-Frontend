'use client';

import { useState } from 'react';

interface CardData {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const featureCards: CardData[] = [
  {
    id: 1,
    title: 'Instant Messaging',
    description: 'Communicate securely with your healthcare provider anytime, anywhere.',
    icon: '💬',
  },
  {
    id: 2,
    title: 'Video Consultations',
    description: 'Schedule and conduct face-to-face consultations from home.',
    icon: '📹',
  },
  {
    id: 3,
    title: 'Prescription Management',
    description: 'Access and manage your prescriptions digitally with ease.',
    icon: '💊',
  },
  {
    id: 4,
    title: 'Medical Records',
    description: 'Keep all your medical history and documents in one secure place.',
    icon: '📋',
  },
  {
    id: 5,
    title: 'Appointment Booking',
    description: 'Schedule appointments with doctors at your convenience.',
    icon: '📅',
  },
  {
    id: 6,
    title: 'Health Insights',
    description: 'Get personalized health recommendations based on your data.',
    icon: '📊',
  },
];

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const totalCards = featureCards.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + cardsPerView) % totalCards);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - cardsPerView + totalCards) % totalCards);
  };

  const getCardIndex = (offset: number) => (currentIndex + offset) % totalCards;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            What We Offer
          </h2>
          <p className="text-slate-600 text-lg">
            A comprehensive platform designed for seamless patient-doctor communication
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[0, 1, 2].map((offset) => {
              const card = featureCards[getCardIndex(offset)];
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="text-5xl mb-4">{card.icon}</div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">{card.title}</h3>
                  <p className="text-slate-600">{card.description}</p>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border border-navy-600 text-navy-600 hover:bg-navy-50 transition-colors"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(totalCards / cardsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex((idx * cardsPerView) % totalCards)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / cardsPerView) === idx
                      ? 'bg-navy-600'
                      : 'bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full border border-navy-600 text-navy-600 hover:bg-navy-50 transition-colors"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
