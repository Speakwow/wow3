import { Avatar, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { Howl, Howler } from 'howler';

const Perfect = {
    icon: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/772b9adf-cda8-4c29-7779-bae3cc394700/sm',
    text: 'Perfect'
}

const Good = {
    icon: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/077cd9c7-a652-4255-998e-e7c258a2a500/sm',
    text: 'Good'
}

const Bad = {
    icon: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/932bb2d8-5f93-4485-159b-a448f10b7100/sm',
    text: 'Bad ~'
}

export const Bravo = ({ score, mistakeCount }: { score: number, mistakeCount: number }) => {
    
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
    } else if (score < 80) {
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