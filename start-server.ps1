# GLTF Player Development Server Launcher (PowerShell)
# UTF-8 Encoding with BOM for Korean support

$Host.UI.RawUI.WindowTitle = "GLTF Player Development Server"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GLTF Player 개발 서버 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "[경고] node_modules 폴더가 없습니다." -ForegroundColor Yellow
    Write-Host "의존성 패키지를 설치합니다..." -ForegroundColor Yellow
    Write-Host ""

    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[오류] npm install 실패" -ForegroundColor Red
        Read-Host "계속하려면 Enter를 누르세요"
        exit 1
    }
    Write-Host ""
}

Write-Host "[정보] Vite 개발 서버를 시작합니다..." -ForegroundColor Green
Write-Host "[정보] 브라우저가 자동으로 열립니다" -ForegroundColor Green
Write-Host "[정보] 서버를 종료하려면 Ctrl+C를 누르세요" -ForegroundColor Green
Write-Host ""

# Start Vite dev server
npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[오류] 서버 시작 실패" -ForegroundColor Red
    Read-Host "계속하려면 Enter를 누르세요"
    exit 1
}
