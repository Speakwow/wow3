'use server'

export async function invokeAPI(apiName:string,content:string) {
    // 使用 fetch 发送 POST 请求到你的 API 路由
    const res = await fetch('localhost:3000/api/'+apiName, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
    });
    return res.json()
}