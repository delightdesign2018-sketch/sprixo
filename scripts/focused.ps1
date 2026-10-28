param([string]$Path = "design/footer.png")
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Resolve-Path $Path).Path)
$bmp = New-Object System.Drawing.Bitmap($img)
$W = $bmp.Width; $H = $bmp.Height
$bgc = $bmp.GetPixel(5,5)

function PxDiff($c) { [math]::Abs($c.R-$bgc.R)+[math]::Abs($c.G-$bgc.G)+[math]::Abs($c.B-$bgc.B) }

Write-Output "== rows with faint non-bg content (possible 1px rules) =="
for ($y=0; $y -lt $H; $y++) {
  $cnt=0; $sumd=0
  for ($x=0; $x -lt $W; $x+=2) { $d = PxDiff $bmp.GetPixel($x,$y); if ($d -gt 6) { $cnt++; $sumd+=$d } }
  if ($cnt -gt 150) { Write-Output ("  y={0,4}  px={1,5}  avgdiff={2,6:0.0}" -f $y, $cnt, ($sumd/[math]::Max(1,$cnt))) }
}

function Crop($x0,$y0,$x1,$y1,$step) {
  Write-Output ""
  Write-Output "== crop x[$x0..$x1] y[$y0..$y1] step=$step =="
  $ramp = " .:-=+*#%@"
  for ($y=$y0; $y -lt $y1; $y+=$step) {
    $line = ""
    for ($x=$x0; $x -lt $x1; $x+=$step) {
      $c = $bmp.GetPixel($x,$y)
      $l = 0.2126*$c.R + 0.7152*$c.G + 0.0722*$c.B
      $line += $ramp[[math]::Min(9,[math]::Floor($l/25.6))]
    }
    Write-Output ("{0,4} |{1}|" -f $y, $line)
  }
}

# email + circular button area
Crop 1080 415 1520 485 4
# eyebrow area
Crop 425 110 620 170 2
# bottom-left contact
Crop 175 585 450 650 3
# bottom-right socials + copyright
Crop 750 585 1730 650 8

$bmp.Dispose(); $img.Dispose()

