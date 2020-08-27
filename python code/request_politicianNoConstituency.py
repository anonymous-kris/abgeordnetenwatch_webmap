import json
import requests
import pandas as pd

#access data and write to dataframe
def get_data(accesspoint, dataname):
    
   
    print("start get_data for " + dataname)


    #access the page and append the page to the dataframe, then repeat for next page until no more iterations needed
    response = requests.get(accesspoint +"&range_end=999")
    data_raw = json.loads(response.text)
    justData = data_raw['data']
    df = pd.json_normalize(data_raw, 'data', max_level = 0 )

    print(df.head())
    print("end get_data for " + dataname)
    print("\n -------------------")
    return df


df = get_data("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period[entity.id]=111", "candidacies_mandates")

#expand electoral_data and merge it back into one df
df2 = pd.json_normalize(df["electoral_data"], max_level = 0, sep = "_")
df2 = df2.add_prefix("electoral_data_")
df = df.join(df2).drop(["electoral_data"], axis=1)

#Filter to only show those without assoiciated constituency
df = df[df['electoral_data_constituency'].isnull()]
#set Index to id
df = df.set_index('id')

#export to json
df.to_json("raw_data/candidacies_mandates(no-constituency).json", orient = "index")