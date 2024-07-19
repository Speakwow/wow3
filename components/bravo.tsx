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

    if (score > 90) {

        return (
            <div className="flex items-center text-center bg-[#FFF5DA] rounded-full px-2 text-2xl">
                <Avatar className="w-12 h-12  bg-[#FFF5DA] rounded-full p-2">
                    <AvatarImage src={Perfect.icon} />
                </Avatar><span className="px-4 mr-4 mt-0.5 text-[#333333]">{Perfect.text}</span>
            </div>
        )
    } else if (score < 70) {
        return (
            <div className="flex items-center text-center bg-[#FFF5DA] rounded-full px-2 text-2xl">
                <Avatar className="w-12 h-12  bg-[#FFF5DA] rounded-full p-2">
                    <AvatarImage src={Bad.icon} />
                </Avatar><span className="px-4 mr-4 mt-0.5 text-[#333333]">{Bad.text}</span>
            </div>
        )
    } else {
        return (
            <div className="flex items-center text-center bg-[#FFF5DA] rounded-full px-2 text-2xl">
                <Avatar className="w-12 h-12  bg-[#FFF5DA] rounded-full p-2">
                    <AvatarImage src={Good.icon} />
                </Avatar><span className="px-4 mr-4 mt-0.5 text-[#333333]">{Good.text}</span>
            </div>
        )
    }
}