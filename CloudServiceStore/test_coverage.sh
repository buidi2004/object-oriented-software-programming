#!/bin/bash

# Navigate to the test directory
cd CloudServiceStore.Tests || exit

echo "🚀 Bắt đầu chạy Unit Test và thu thập Code Coverage bằng Coverlet..."

# Run dotnet test with coverlet arguments
dotnet test \
  /p:CollectCoverage=true \
  /p:CoverletOutputFormat="lcov" \
  /p:CoverletOutput="./TestResults/" \
  /p:Include="[CloudServiceStore.Application]*" \
  /p:Exclude="[CloudServiceStore.Application]*.DTOs.*%2c[CloudServiceStore.Application]*.Exceptions.*"

echo "✅ Đã xuất báo cáo Coverage!"
echo "📄 File lcov.info cho Coverage Gutters (VS Code) nằm tại: CloudServiceStore.Tests/TestResults/lcov.info"
echo "Bật tính năng 'Watch' của Coverage Gutters trên thanh trạng thái để xem trực quan các luồng rẽ nhánh."
