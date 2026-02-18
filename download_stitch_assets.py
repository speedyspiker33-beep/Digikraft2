import subprocess
import os

screens = [
    {
        "name": "01_Admin_Dashboard",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidUnl3gNgXM_kboQKqgkTxKq_D3CVMDDu7Y5BXx_BtOqVgnXPFSaHN2W1RmgqIP0eYWLVdmbqA0AZBKo6RiXt1sMllMrO1uLvu6wu-JG7ZdaRe6XrM0KnXq-hQN7D-CWR5XHcx3mBKbkevE7FnodWkVekCExuC-tpobgXHP1ixP8Q3PoUuQImfxvJTbJHwV80Yc9fQmVAKFPML-jcNqauuU-R_BPgmS_iKve2LKzFp-5VNjFlcFrx-o_4cj5",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M5NjY5MzlmZWNhNjQyYTViNGU0YjRiZTYzNmRlNjNkEgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "02_Settings_General",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidWdB5a34jGAIkPV-GyZKfdpIYp6aEVk3nlFm_lkwYPnMVQcTYTX9nWHzh7oWJRqnwlakHdTk3Gt5nAa4w0v9W65ADwdfyOKC_KgSaRkFJ03Nwv1U46lJdAiYb6Mb1GVBEAsAQbIzUN49rOPSEpXqmt0ZDKyJtE2xSHITkHg6gZapdhaXwWodG2jxUrpJhda0ocsEyxMcr6YbwS2mIoL68zAiKBYdOiZNQtI-19_d9SavDeElUSj52XhKzC5",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzZjNzc2Y2QyZGQ5ZDQ1NDFiYjFmYmE1NTBjNWNjNGQ3EgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "03_Settings_Auth_Security",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidUXcW789-PRV9EmYMfiGWxxkwnH8P6DNvyO1qesAVeWfDIZ5plkmF2tOP8K0--462pn8auZ0VnLRVLq5u8Quea4yoZFYAq-2u15EhIZQNFV7zZyLP5iGbMQCEGmvIEtXDWm0lmEe5T8upOrmcHZCjE4gqKMCAUS5lsH4eWQpaOjOeUEPIKb-U5e81N4_9zogN_9KYL95BbsH1C_5TlYBWLYdl35Geqcm5dx1IPDsJx6ZVx576zfrR5Rd30",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzhhMDQxYTJmMmU5ZDQyOTNhYjU5MzdmZjMzYjYyYzhiEgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "04_Appearance_Header_Builder",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidUhOed-0qA3ROfFhxPgqW9JsVvIy0FLXJ3sawp44IEk1ATiBLEACDDLe6cOSpccxjY_M7wxKTGylv1ouw_NzZJ0ERnS9zcmSe-fO7j6vGldT5BSiemSbecCgWfN1CUq4XnCgD5blyYcjJ6KZFyjC_vMEzfUthRZnKB43x2YLcoQbC4iz-HQmzLoD5CB-DO-gJeCai2Yj1BcsyWYWOdWCpXIiPjSXWuxR69sbMZSLf5Hl-JvIINbm_C1uxk3",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzJhYWMwMTg4YzFmMTRjMjE5ODAzOGRhNDZkZjQzYjY5EgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "05_Appearance_Homepage_Builder",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidVLYEVfHqIGr9Yj0HptdBVUtWIbVPlCTehIG46BQyoVKM7J3T8YF2_KijsGQpuaQE8aOyM8TBKQRJQoIaenzrAx_hWwiVEYcJLqpTNmxE4g_7SqvE29fYOkqrDOEfeoKPpyGUOywwIPGnhO8CtO5HBdmR8BKDibnHQDgsweh7MLauKlocc8mi8DFaCjeUF5cOL09vkKfyUEEzWl-JNRiPazcUERbFnaLIU4vlkezawl-Ic9FMSMaZc55kAR",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc1YmVjMGFiNWMzMjQzMjU5NGQyOGE0NmQwN2EyMDdlEgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "06_Appearance_Sidebar_Builder",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidVk6VDaJgrDhZ7s4Tt0_Sj6ow1SUmgwQ_4lFGZC2el1K7gyuk-vSz5KMwduH0WOv1e3EcaccLvIK_YCLgChirxgugWhmEL97kLuu5W4YO4ctmqzGNDPT95q3epT6EOP99909Tw2A4mUm7be6UQcwEjIABdZq7IuQGTqO1-BSVY3UafsS_uYQzP-MhmVnAAuikJLb5sWhb8VJ-XAhHYNiJ_9Lc3kYZvBAzoGiCrbSYMVP3DF4fTwY6dEAon0",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzk2Njg4NmFkZGVkNTQwYWFiMGVlNjg0ZDE4OGZiOTU4EgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "07_Category_Manager",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidXuci4wP6jkptIR9gnnOHF2sz0d5Tm5Ku94h9VS_hSJmAB4sXN_C5Fh0pMsevIvXKhKtFNy1NqOvzeHHFMKCNQsrlxdIweGMjGXrqawXEpCKSqzLz7-ZNcvqb5nOBluOj-k8MltvB_vGuEd_Sbu-Dbn_-wBPWuQQ69MzJMq0pklBdyyiUuHg8ji1GCSgQqA-X9Cm-MT7HnWVnTT9SRoZ_w5k673KJNWLY4JNA40wtGcH40Up3Si6PX_g4IB",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2MxZjM0OGM2YzhiZDRlZTQ4NTc5YzYzZjdjMmZkMTA4EgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "08_Appearance_Footer_Builder",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidUWu7f2lKFjzTEztGpK5J418cO2K3yw-cQ-kDdmxcVCRbls836H1vO0lr0XGof9gvZmYTPJ0PNOesAHw1iegv0n6_tWeCi4CrM2vXLoddQe9BPrxn2YjGD4bi_veok8yy9h9tq_JKH5GiElyeBaq9dCc-ReJpdNkjnDVcmMpkuki3h5A3AhzDRGPxcpKnwtfZkfgL0j42elbc3Ab-JsXQwQrfQvH6mVU13-BpWIXzekEKpNJcBAmH8rkeT-",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzA4YTQ2M2E0YTNhNjRhOWRhYWJhMjMyNzY4MjE0NWU3EgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "09_Email_Template_Builder",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidWxsUwhrmO40CCQNZggOF4VU1H49PAY6uCHgJ9zDd0GeuCJktB61zD37JT3AJJ4zMwGHmLA_y2CVvsHrGdSuLQkzDBlP0A28IuWiqxjudMhSqfrpeZ5Y7tmWkoSvk_o-o26l5E1Kl0LC7BHMM59BCuz9WBBfXzQvDgZHh6zax_xzRSBENHDM2tUi7UeW69xCb5GaixROXYbv2xPGtFcGWRYaNHJimPsSfs5n8m0zQ4kBXJqCGtb-KGhxVRE",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2U5NzhhNDcwZWRhODRhOWZiNmUyZDU0YjY5MWQ4ZjkyEgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "10_Satellite_Page_Customization",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidUFRr_-GOC6UIWc_mfxGS6rpbC1wQGUmEHfqiNZZc013HodJI5uQC525-utwYpxoQQ60vo2i2Ut7neR29_7iNG66nEZiZWdv-DHLA9s7JFwQaFE4JGYR1udjASTqZhCd3Kqce8UetvA_izz2FsQh1l0zh48fUw0sDrTPK2OE1POT5TTHpFyMqCtKdM2fS2yW3Eova-4X3FFcNiq0H3Q5kYWsnz3U72A7cbJ_sekWoI3Vo46nkwuP_W6Ofbb",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzg0OTVjMjdhMmFjMTRkMmU5MWI3ZGMxZTBlMWJmNTI3EgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "11_Database_Schema_Storage",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidXib0Ip5i5tbuB_upsd1Brp9HWcQvmd0lRMZu_4Cg8F2RiID0fHBF-FMDL0sfSWslFT0y9IzEYW_pKz1TFebUcd4wLiyuIP5C-E28Y-9jBTBsvtLsin7ve6qBAwcaV2OLhptIKsKiAPBB3Dh6zmz03PkriLnnBoH8Q_uuOju2ijMbSyd7wCobiX5sS3GeghML6OSwkGGWqrTUZ-__HH3gAV9A1sf5slRZkEQ4aN_PczknmtUVHTKuXp-bEA",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UyYmI1YzcxZDgyMTQyODc4ZmM3MzEwY2I3MGNiYTQwEgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "12_Login_Page",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidVJNMGkTxNG5l-FYapUjWpLfnjoqvCdBmnyyHTQBz3QT5pRLTD5E9-yUFHO3Db8Z3r0YIgPI0_sHuB47R6cFRoJv5nW0yHdXoDQNCXH0b5PN45t4yts7NHKyMvNcWS-lb5DqMHv5Vyqh7xg6S7D-FhO__cttJmIR_g1mSJ-LQnnvAXElTAh-NoG95NpCG6zDodA-ytMMBEXnrGzI2PXRNEbrMoHxSeX8wzdn5SWRJDiaT_fTvlvkDe53NQ",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzYwNWYyNTc0ZWJmMjQyNzE4ODcyMDcyMzBkYmNlYWU5EgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "13_User_Management",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidVZOCVNpwm34LWtwX4D6lmW4QqBBZZAzvIFl1lY3SE7ZxcWntT8vXVT5KZMzuMdufVYkDjwUyBr9I5QREvJzplDfFwErlU8Y1JRl9IDyBIKoFyFMXuai426nTaafFT405ZrmDgRPvjNe8XXBMK5K4SDs-tQCQp8rBc7KI_vcJDJ7v2CEIdK5D2xMEHJyCBzBhCIeFcDdw2_7ak-NyIf7VvF3ou4qdSyokM1a_4qlpn1iF5Iu7mJkS2Oe74",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc0YjU1YmZlZWZkZDRmYjg5N2IwMjlkNTI2ZjYxNjEyEgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    },
    {
        "name": "14_AI_Agents_Management",
        "img": "https://lh3.googleusercontent.com/aida/AOfcidWcFsVonwhHiKHgchZSLV4Ett8tbHj6yT64VQzLrBLb52Rvd-ecSkuoy_AZw4nCKfcLzcNcXE0WFN9LN-9vVeLgTmv69chf3xCh1t-htNkxsGFIl-dWeNMidYPqpFKzWPbAZNMYVNCoKCHO7Ah-sEQzInCbkEsfwtp-glQnc2x9Ss9fRFod6JdinVsD8mQk09DRINOA95W-C230yFts7R0SANzhbpofvZk4il3NSUfRtyjuY5uNStCv7Qxa",
        "code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzMzMGI3MzUwMGY1ODQ2MzRiZTc3YjM0MjI2NjI4OWQzEgsSBxCv96Ca6AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzQ5Nzc3NDQyNzYyNDcyMjgwMw&filename=&opi=89354086"
    }
]

output_dir = "stitch_downloads"
os.makedirs(output_dir, exist_ok=True)

for screen in screens:
    # Compile commands
    img_cmd = ["curl", "-L", screen["img"], "-o", f"{output_dir}/{screen['name']}.png"]
    code_cmd = ["curl", "-L", screen["code"], "-o", f"{output_dir}/{screen['name']}.html"]
    
    print(f"Downloading {screen['name']}...")
    try:
        subprocess.run(img_cmd, check=True)
        subprocess.run(code_cmd, check=True)
    except Exception as e:
        print(f"Error downloading {screen['name']}: {e}")

print("Done.")
