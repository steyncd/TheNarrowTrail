# Quick API Test Script
# Tests the new permission endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API ENDPOINT TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($response.status -eq "ok") {
        Write-Host "✅ PASSED - Server is healthy" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "❌ FAILED - Unexpected response" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Login (you need to provide valid credentials)
Write-Host "`nTest 2: Login..." -ForegroundColor Yellow
Write-Host "Please enter admin credentials:" -ForegroundColor Cyan
$email = Read-Host "Email"
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    $loginBody = @{
        email = $email
        password = $passwordPlain
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ PASSED - Login successful" -ForegroundColor Green
        $token = $loginResponse.token
        Write-Host "   User: $($loginResponse.user.name)" -ForegroundColor Blue
        $testsPassed++
        
        # Test 3: Get User Permissions
        Write-Host "`nTest 3: Get User Permissions..." -ForegroundColor Yellow
        try {
            $headers = @{
                Authorization = "Bearer $token"
            }
            $permResponse = Invoke-RestMethod -Uri "$baseUrl/api/permissions/user/permissions" -Method Get -Headers $headers
            
            Write-Host "✅ PASSED - Retrieved user permissions" -ForegroundColor Green
            Write-Host "   Permissions: $($permResponse.permissions.Count)" -ForegroundColor Blue
            Write-Host "   Roles: $($permResponse.roles -join ', ')" -ForegroundColor Blue
            $testsPassed++
            
            # Test 4: List All Permissions
            Write-Host "`nTest 4: List All Permissions..." -ForegroundColor Yellow
            try {
                $allPerms = Invoke-RestMethod -Uri "$baseUrl/api/permissions/permissions" -Method Get -Headers $headers
                Write-Host "✅ PASSED - Retrieved all permissions" -ForegroundColor Green
                Write-Host "   Total Permissions: $($allPerms.Count)" -ForegroundColor Blue
                
                # Group by category
                $byCategory = $allPerms | Group-Object -Property category
                Write-Host "   Categories:" -ForegroundColor Blue
                foreach ($cat in $byCategory) {
                    Write-Host "      $($cat.Name): $($cat.Count)" -ForegroundColor Gray
                }
                $testsPassed++
            } catch {
                Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
                $testsFailed++
            }
            
            # Test 5: List All Roles
            Write-Host "`nTest 5: List All Roles..." -ForegroundColor Yellow
            try {
                $allRoles = Invoke-RestMethod -Uri "$baseUrl/api/permissions/roles" -Method Get -Headers $headers
                Write-Host "✅ PASSED - Retrieved all roles" -ForegroundColor Green
                Write-Host "   Total Roles: $($allRoles.Count)" -ForegroundColor Blue
                foreach ($role in $allRoles) {
                    Write-Host "      $($role.name): $($role.permission_count) permissions" -ForegroundColor Gray
                }
                $testsPassed++
            } catch {
                Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
                $testsFailed++
            }
            
            # Test 6: Paginated User List
            Write-Host "`nTest 6: Paginated User List..." -ForegroundColor Yellow
            try {
                $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/users?page=1&limit=5" -Method Get -Headers $headers
                Write-Host "✅ PASSED - Retrieved paginated users" -ForegroundColor Green
                Write-Host "   Total Users: $($usersResponse.pagination.total)" -ForegroundColor Blue
                Write-Host "   Current Page: $($usersResponse.pagination.currentPage)/$($usersResponse.pagination.totalPages)" -ForegroundColor Blue
                Write-Host "   Users in response: $($usersResponse.users.Count)" -ForegroundColor Blue
                $testsPassed++
            } catch {
                Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
                $testsFailed++
            }
            
            # Test 7: User Search
            Write-Host "`nTest 7: User Search..." -ForegroundColor Yellow
            try {
                $searchResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/users?search=steyn&limit=10" -Method Get -Headers $headers
                Write-Host "✅ PASSED - Search completed" -ForegroundColor Green
                Write-Host "   Results found: $($searchResponse.users.Count)" -ForegroundColor Blue
                $testsPassed++
            } catch {
                Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
                $testsFailed++
            }
            
        } catch {
            Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
            $testsFailed++
        }
        
    } else {
        Write-Host "❌ FAILED - No token received" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$total = $testsPassed + $testsFailed
$passRate = if ($total -gt 0) { [math]::Round(($testsPassed / $total) * 100, 1) } else { 0 }

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

if ($passRate -eq 100) {
    Write-Host "`n✅ ALL TESTS PASSED! API IS WORKING CORRECTLY!" -ForegroundColor Green
} elseif ($passRate -ge 70) {
    Write-Host "`n⚠️  MOST TESTS PASSED - REVIEW FAILURES" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ MANY TESTS FAILED - IMMEDIATE ATTENTION NEEDED" -ForegroundColor Red
}

Write-Host "========================================`n" -ForegroundColor Cyan
