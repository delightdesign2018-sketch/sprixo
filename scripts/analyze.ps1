param(
  [string]$Path = "design/footer.png",
  [int]$Cols = 88
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile((Resolve-Path $Path).Path)
$bmp = New-Object System.Drawing.Bitmap($img)
$W = $bmp.Width; $H = $bmp.Height
$cellW = [math]::Ceiling($W / $Cols)
$rows = [math]::Ceiling($H / $cellW)

function Luma($c) { 0.2126*$c.R + 0.7152*$c.G + 0.0722*$c.B }

$ramp = " .:-=+*#%@"

Write-Output "IMAGE $Path  ${W}x${H}  cell=${cellW}px  grid=${Cols}x${rows}"
Write-Output ""
Write-Output "LUMINANCE MAP (. dark -> @ light):"
for ($ry = 0; $ry -lt $rows; $ry++) {
  $line = ""
  for ($rx = 0; $rx -lt $Cols; $rx++) {
    $x0 = $rx*$cellW; $y0 = $ry*$cellW
    $sum = 0.0; $n = 0
    for ($y = $y0; $y -lt [math]::Min($y0+$cellW,$H); $y += 4) {
      for ($x = $x0; $x -lt [math]::Min($x0+$cellW,$W); $x += 4) {
        $sum += (Luma $bmp.GetPixel($x,$y)); $n++
      }
    }
    $avg = if ($n -gt 0) { $sum / $n } else { 0 }
    $idx = [math]::Min(9, [math]::Floor($avg / 25.6))
    $line += $ramp[$idx]
  }
  Write-Output ("{0,4} |{1}|" -f ($ry*$cellW), $line)
}
Write-Output ""

# Palette of quantized colors with pixel share
$counts = @{}
for ($y = 0; $y -lt $H; $y += 3) {
  for ($x = 0; $x -lt $W; $x += 3) {
    $c = $bmp.GetPixel($x,$y)
    $key = "{0:X2}{1:X2}{2:X2}" -f [int]([math]::Round($c.R/16)*16), [int]([math]::Round($c.G/16)*16), [int]([math]::Round($c.B/16)*16)
    if ($counts.ContainsKey($key)) { $counts[$key]++ } else { $counts[$key] = 1 }
  }
}
$total = ($counts.Values | Measure-Object -Sum).Sum
Write-Output "PALETTE (quantized, share %):"
$counts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 14 | ForEach-Object {
  Write-Output ("  #{0}  {1,6:0.00}%" -f $_.Key, (100*$_.Value/$total))
}
Write-Output ""

# Accent colors: saturated pixels only
$acc = @{}
for ($y = 0; $y -lt $H; $y += 2) {
  for ($x = 0; $x -lt $W; $x += 2) {
    $c = $bmp.GetPixel($x,$y)
    $max = [math]::Max($c.R,[math]::Max($c.G,$c.B)); $min = [math]::Min($c.R,[math]::Min($c.G,$c.B))
    if ($max -eq 0) { continue }
    $sat = 1 - ($min / $max)
    if ($sat -gt 0.35 -and $max -gt 60) {
      $key = "{0:X2}{1:X2}{2:X2}" -f [int]([math]::Round($c.R/32)*32), [int]([math]::Round($c.G/32)*32), [int]([math]::Round($c.B/32)*32)
      if ($acc.ContainsKey($key)) { $acc[$key]++ } else { $acc[$key] = 1 }
    }
  }
}
if ($acc.Count) {
  Write-Output "SATURATED / ACCENT COLORS:"
  $acc.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 12 | ForEach-Object {
    Write-Output ("  #{0}  {1} samples" -f $_.Key, $_.Value)
  }
} else { Write-Output "SATURATED / ACCENT COLORS: none (monochrome)" }
Write-Output ""

# Row bands: mean luma per row (coarse) to find section boundaries
Write-Output "ROW BANDS (mean luma every 10px):"
for ($y = 0; $y -lt $H; $y += 10) {
  $sum = 0.0; $n = 0
  for ($x = 0; $x -lt $W; $x += 6) { $sum += (Luma $bmp.GetPixel($x,$y)); $n++ }
  $avg = $sum / $n
  $bar = "#" * [int]([math]::Round($avg/6))
  Write-Output ("{0,4} {1,6:0.0} {2}" -f $y, $avg, $bar)
}

$bmp.Dispose(); $img.Dispose()
