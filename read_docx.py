import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            texts = []
            for node in tree.iter():
                if node.tag == f"{{{namespaces['w']}}}t":
                    if node.text:
                        texts.append(node.text)
                elif node.tag == f"{{{namespaces['w']}}}p":
                    texts.append('\n')
            return "".join(texts)
    except Exception as e:
        return str(e)

with open('output.txt', 'w') as f:
    f.write(read_docx("/home/buidi/Tài liệu/laptrinhphanemhuogndoituong/Thiet-ke-he-thong-toi-uu-3.docx"))
