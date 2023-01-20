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

export interface MondayItem {
    id: string,
    name: string,
    column_values: {
        id: string
        title: string
        value: string
    }[],
    subitems: any[]
}

export async function update(board: number, id: number, column_id: string, value: any) {
    const values = { id: +id, value, board, column_id };
    try {
        const result = await gql(values, `#graphql
  mutation ($id: Int!,$value:JSON!,$board:Int!,$column_id:String!) {
change_column_value(
 item_id:$id
 column_id:$column_id,
 board_id:$board,
 value:$value
) {
 id
name,
column_values(ids:[$column_id]){
  id
  title
  value
}
}
}
     `);
        if (true) {
            var z = undefined;
            if (result?.change_column_value) {
                z = { ...result.change_column_value }
                delete z.column_values
            }
            console.log(
                {
                    values,
                    result: z,
                    column_values: result?.change_column_value?.column_values
                });
            return result?.change_column_value;

        }
    } catch (err: any) {
        console.error({
            error: values,
            err
        });
        return {
            error: err.message
        }
    }
}