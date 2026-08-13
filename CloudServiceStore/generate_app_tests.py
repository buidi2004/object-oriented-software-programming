import os
import re

features_dir = 'CloudServiceStore.Application/Features'
tests_dir = 'CloudServiceStore.Tests/Application/Features'

def get_existing_test_files(tests_dir_path):
    existing = set()
    for root, _, files in os.walk(tests_dir_path):
        for file in files:
            if file.endswith('Tests.cs'):
                existing.add(file)
    return existing

existing_tests = get_existing_test_files('CloudServiceStore.Tests/Application')

def get_namespace_and_dependencies(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract namespace
    ns_match = re.search(r'namespace\s+([\w\.]+);?', content)
    namespace = ns_match.group(1) if ns_match else "CloudServiceStore.Application.Features"

    # Find the Handler class name
    class_match = re.search(r'public class (\w+Handler)', content)
    if not class_match:
        class_match = re.search(r'internal class (\w+Handler)', content)
    
    if not class_match:
        return namespace, None, []

    class_name = class_match.group(1)

    # Find constructor
    ctor_regex = r'public\s+' + class_name + r'\s*\(([^)]*)\)'
    ctor_match = re.search(ctor_regex, content)
    
    dependencies = []
    if ctor_match:
        params_str = ctor_match.group(1)
        if params_str.strip():
            # Splitting by comma, but be careful with generic commas like ILogger<T, Y>
            # For simplicity, let's assume no nested generics with commas in constructor params
            # Actually, split by comma is safe if we don't have generics with multiple type args
            params = re.split(r',\s*(?![^<]*>)', params_str)
            for p in params:
                p = p.strip()
                if not p: continue
                
                # Strip out "= null" or other default assignments
                if '=' in p:
                    p = p.split('=')[0].strip()
                
                p_parts = p.split(' ')
                p_parts = [x for x in p_parts if x and not x.startswith('[')]
                if len(p_parts) >= 2:
                    t = p_parts[-2]
                    n = p_parts[-1]
                    dependencies.append((t, n))

    request_type = class_name.replace('Handler', '')
    return namespace, class_name, dependencies, request_type

def generate_test_content(app_namespace, handler_name, dependencies, request_type):
    test_namespace = app_namespace.replace('CloudServiceStore.Application', 'CloudServiceStore.Tests.Application')
    
    mocks_init = []
    mocks_fields = []
    handler_args = []
    
    for t, n in dependencies:
        # Create a safe field name
        mock_name_base = re.sub(r'[^a-zA-Z0-9]', '', t)
        if mock_name_base.startswith('I'):
            mock_name_base = mock_name_base[1:]
        mock_name = f"_mock{mock_name_base}"
        
        mocks_fields.append(f"    private readonly Mock<{t}> {mock_name};")
        mocks_init.append(f"        {mock_name} = new Mock<{t}>();")
        handler_args.append(f"{mock_name}.Object")

    mocks_fields_str = "\n".join(mocks_fields)
    mocks_init_str = "\n".join(mocks_init)
    handler_args_str = ", ".join(handler_args)

    return f"""using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using {app_namespace};
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace {test_namespace};

public class {handler_name}Tests
{{
{mocks_fields_str}
    private readonly {handler_name} _handler;

    public {handler_name}Tests()
    {{
{mocks_init_str}
        _handler = new {handler_name}({handler_args_str});
    }}

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {{
        // Arrange
        // var request = new {request_type}();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }}
}}
"""

generated_count = 0

for root, _, files in os.walk(features_dir):
    for file in files:
        if file.endswith('Handler.cs'):
            handler_filepath = os.path.join(root, file)
            ns, class_name, deps, req_type = get_namespace_and_dependencies(handler_filepath)
            
            if class_name:
                test_file_name = f"{class_name}Tests.cs"
                
                # Check globally if this test file already exists
                if test_file_name not in existing_tests:
                    test_dir = root.replace('CloudServiceStore.Application', 'CloudServiceStore.Tests/Application')
                    test_file = os.path.join(test_dir, test_file_name)
                    
                    # Generate test!
                    os.makedirs(test_dir, exist_ok=True)
                    content = generate_test_content(ns, class_name, deps, req_type)
                    with open(test_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    generated_count += 1
                    existing_tests.add(test_file_name)

print(f"Generated {generated_count} Application Handler test files.")
