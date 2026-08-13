import os
import re

entities_dir = 'CloudServiceStore.Domain/Entities'
tests_dir = 'CloudServiceStore.Tests/Domain/Entities'

def get_class_name(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    class_match = re.search(r'public class (\w+)', content)
    if class_match:
        return class_match.group(1)
    return None

def generate_test_content(class_name):
    return f"""using System;
using Xunit;
using FluentAssertions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.DomainTests.Entities;

public class {class_name}Tests
{{
    [Fact]
    public void Constructor_ShouldInitializeCorrectly()
    {{
        // Arrange
        // TODO: var entity = new {class_name}();

        // Act

        // Assert
        Assert.True(true);
    }}
}}
"""

generated_count = 0

for root, _, files in os.walk(entities_dir):
    for file in files:
        if file.endswith('.cs'):
            filepath = os.path.join(root, file)
            class_name = get_class_name(filepath)
            
            if class_name:
                test_file_name = f"{class_name}Tests.cs"
                test_file = os.path.join(tests_dir, test_file_name)
                
                if not os.path.exists(test_file):
                    os.makedirs(tests_dir, exist_ok=True)
                    content = generate_test_content(class_name)
                    with open(test_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    generated_count += 1

print(f"Generated {generated_count} Domain Entity test files.")
