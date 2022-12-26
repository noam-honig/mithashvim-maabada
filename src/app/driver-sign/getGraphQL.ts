import axios from "axios";

export async function gql(variables: any, s: string) {
    const result = (await axios.post('https://api.monday.com/v2',
        JSON.stringify({
            "query": s,
            "variables": variables
        })
        , {
            headers: {
                'authorization': process.env["MONDAY_API_TOKEN"]!,
                'content-type': 'application/json',
            },
        }));
    if (result.data.data === undefined) {
        console.error("monday undefined response", variables, result.data, result.data?.errors);

    }
    return result.data.data


}