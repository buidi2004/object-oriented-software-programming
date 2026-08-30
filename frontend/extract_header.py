import json
import sys

transcript_path = "/root/.gemini/antigravity-ide/brain/a95e4f19-235e-404f-a2f9-02f1db984051/.system_generated/logs/transcript.jsonl"
header_content = None

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                        args = call['args']
                        if 'TargetFile' in args and 'Header.tsx' in args['TargetFile']:
                            if call['name'] == 'write_to_file':
                                print(f"Full write at {data.get('step_index')}")
                            else:
                                print(f"Diff at {data.get('step_index')}")
        except:
            pass
