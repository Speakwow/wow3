import { Avatar, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { Howl, Howler } from 'howler';


export const Bravo = ({ score, mistakeCount }: { score: number, mistakeCount: number }) => {
    const Perfect = {
        icon: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/3aa074de-ad48-4306-2e67-dc0d4264e200/sm',
        text: 'Perfect'
    }
    
    const Good = {
        icon: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/36c84960-c1fb-45a0-f531-1f69440e3400/sm',
        text: 'Good'
    }
    
    const Bad = {
        icon: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/afeb650a-5785-4355-9419-8b33337ae900/sm',
        text: 'Bad ~'
    }

    var sound = new Howl({
        src: ['/sound/game_correct.mp3'],
        format: ['mp3'],
        autoplay: true,
    });
    sound.play();

    console.log(mistakeCount)

    if (mistakeCount == 0) {
        console.log(Perfect.icon)
        

        return (
            <div className="flex items-center text-center bg-[#FFF5DA] rounded-full px-2 text-2xl">
                <Avatar className="w-12 h-12  bg-[#FFF5DA] rounded-full p-2">
                    <AvatarImage src={Perfect.icon} />
                </Avatar><span className="px-4 mr-4 mt-0.5 text-[#333333]">{Perfect.text}</span>
            </div>
        )
    } else if (mistakeCount >= 2) {
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