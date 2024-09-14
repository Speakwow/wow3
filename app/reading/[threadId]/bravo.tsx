import { Avatar, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { Howl, Howler } from 'howler';

const Perfect = {
    icon: '/ui/emoji-perfect.webp',
    text: 'Perfect'
}

const Good = {
    icon: '/ui/emoji-good.webp',
    text: 'Good'
}

const Bad = {
    icon: '/ui/emoji-bad.webp',
    text: 'Bad ~'
}

export const Bravo = ({ score }: { score: number }) => {
    
    var sound = new Howl({
        src: ['/sound/game_correct.mp3'],
        format: ['mp3'],
        autoplay: true,
    });
    sound.play();

    if (score > 0) {

        return (
            <div className="flex items-center text-center rounded-full px-2 text-xl">
                ✅
            </div>
        )
    } else if (score == 0) {
        return (
            <div className="flex items-center text-center  rounded-full px-2 text-xl">
                <Avatar className="w-6 h-6  bg-[#FFF5DA] rounded-full p-2">
                    <AvatarImage src={Bad.icon} />
                </Avatar><span className="px-4 mr-4 mt-0.5 text-[#333333]">❌</span>
            </div>
        )
    } 
}