import { Avatar, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { Howl, Howler } from 'howler';

const Perfect = {
    icon: 'https://s3-alpha-sig.figma.com/img/967e/ba0a/cfb7fb1c0329894d880403a1410ed2d1?Expires=1715558400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Vq9MvxiXXfVjGRnvQfjQ7HWc5GBwL6ueI0q4P3WuSGGOuLIC~s3mb27~lM1AD03HneCZMxpTs4IyZo6D4P8xa6NaIEEpub9nxXoKWSZvS4lgVoprBUwsHukuGykVBHPM6RL9DWS39zmCYC008CESvBRRvR6zhsZhBaGHzRUJsJ~V-fZrX8xyAdcvmypqvAF6lvinnSFGKTR37AkOzl3ZXBucwFn05r1S-GxgrX5Ty0bGxQWEUNhmsrIVHhIZjSpb1oVEh0pcuHfs6kddxcrzP029YEhkECN8EeZBEggMG-8VJxjrCel~fZ~6uNUPolC4NPjsVg7K-QGQ63j0bMN62Q__',
    text: 'Perfect'
}

const Good = {
    icon: 'https://s3-alpha-sig.figma.com/img/a97b/ae8e/8b5aac62d26966a56781f6f68a37dd6f?Expires=1715558400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qVUAb-VGOWgMaDv8l8KNxcjgz1ESrQyj~ZjE83-OywTygZI4xDK46LmR9FtB8H1SfA6Qk1KfRTU89PM5S02Gm-1kySoXeEEzCn8tgULPq4HZLzttq8-sMv34XJDeWQMGtqF5A8FBTCmpveGFGmX21S8yfWGhABi13WOgEp2rbogb4vBWOnVnqyh~XNOGy~xhmeTVEaHGVeUELHDqViwVqj29YwFXVEVEGfPgkk7kd21f78VLoZ6vxUFupiVq4leSFq3mn54AeTA4mDp4bp0g22-cq8-v3pPcOvjl5wi7cDSVKq0TlFUQo2fjIcNryKzuRBY2I0Tfn38oJ6x95m8xnA__',
    text: 'Good'
}

const Bad = {
    icon: 'https://s3-alpha-sig.figma.com/img/177d/7418/98096a969ec3b337620b216456303761?Expires=1715558400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=lZYSFY8vwCIP2ELU6Ek-EN~XzOwrJPpQT8ndCqFQJZgOs2bfBaZ2wgIam9T776eEDnO7aZF3m8Z8-~VhYIHK-Y2r~4kBI7dPMXnaS9ukCXCBZiLGgn5tLC-KvtIZEYp7fHqwQ5yV9ygE9nk4fTsUiSIJDooEoBZR9w8iK~njDa~3NxftzWakiiKTL29XoGxwDuSv-V0~MpIpPxbAUhdaGqT5v3bbEMTIRFXlTyFBwcaVTQybsVdiPn3GRev1WUwyrAQq0G056gM-fs5gMkIoLy8MqICsbjOCpUbHgtOEVKgmlVlQJOsg5MB0PPetaC8YaaNMwkm8~nHbZgtZnBS8dA__',
    text: 'Bad ~'
}

export const Bravo = ({ score, mistakeCount }: { score: number, mistakeCount: number }) => {

    var sound = new Howl({
        src: ['/sound/game_correct.mp3'],
        format: ['mp3'],
        autoplay: true,
    });
    sound.play();

    console.log(mistakeCount)

    if (mistakeCount == 0) {

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