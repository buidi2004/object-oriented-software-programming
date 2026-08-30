import json

transcript = "/root/.gemini/antigravity-ide/brain/a95e4f19-235e-404f-a2f9-02f1db984051/.system_generated/logs/transcript.jsonl"
with open(transcript, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] in ['multi_replace_file_content', 'replace_file_content']:
                        args = call['args']
                        if 'Header.tsx' in args.get('TargetFile', ''):
                            print(f"=== STEP {data['step_index']} ===")
                            if 'ReplacementChunks' in args:
                                print(args['ReplacementChunks'])
                            elif 'ReplacementContent' in args:
                                print(args['ReplacementContent'])
        except Exception:
            pass
