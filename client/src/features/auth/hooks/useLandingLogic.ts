import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
  Data for the slides.
  Could be moved to a constants file or kept here if specific to this hook.
*/
export type Slide = {
    id: number;
    title: string;
    body: string;
    imagePlaceholderColor: string;
};

const slides: Slide[] = [
    {
        id: 0,
        title: 'AI-Powered Workouts',
        body: 'Get personalized fitness plans crafted by AI that adapt to your goals, level, and schedule.',
        imagePlaceholderColor: 'bg-emerald-900',
    },
    {
        id: 1,
        title: 'Smart Nutrition',
        body: 'Scan your kitchen ingredients and get AI-generated recipes that match your calorie goals.',
        imagePlaceholderColor: 'bg-orange-800',
    },
    {
        id: 2,
        title: 'Easy Tracking',
        body: 'Track your workouts, calories, and progress with beautiful charts — even offline.',
        imagePlaceholderColor: 'bg-blue-900',
    },
];

export const useLandingLogic = () => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex((prev) => prev + 1);
        }
    };

    const handleSkip = () => {
        // Skip to the last slide where the CTA is
        setCurrentSlideIndex(slides.length - 1);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignUp = () => {
        navigate('/login?mode=signup');
    };

    const currentSlide = slides[currentSlideIndex] ?? slides[0];
    const isLastSlide = currentSlideIndex === slides.length - 1;

    return {
        currentSlide,
        currentSlideIndex,
        isLastSlide,
        slides,
        handleNext,
        handleSkip,
        handleLogin,
        handleSignUp,
    };
};
