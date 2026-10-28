param([string]$Path, [string]$Rows)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$img=[System.Drawing.Image]::FromFile((Resolve-Path $Path).Path)
$b=New-Object System.Drawing.Bitmap($img)
$RowList = @(($Rows -split ',') | ForEach-Object { [int]$_.Trim() })
"file=$Path  $($b.Width)x$($b.Height)"
foreach ($y in $RowList) {
  if ($y -ge $b.Height) { continue }
  $vals = for ($x=0; $x -lt $b.Width; $x+=7) { $c=$b.GetPixel($x,$y); $c.R }
  $min=($vals|Measure-Object -Minimum).Minimum
  $max=($vals|Measure-Object -Maximum).Maximum
  $avg=[math]::Round((($vals|Measure-Object -Average).Average),1)
  "  y=$y  min=$min max=$max avg=$avg"
}
$cols = @()
for ($x=0; $x -lt [math]::Min($b.Width,40); $x+=10) { $c=$b.GetPixel($x,$RowList[0]); $cols += ("#{0:X2}{1:X2}{2:X2}" -f $c.R,$c.G,$c.B) }
"  sample colors: " + ($cols -join ' ')
$b.Dispose(); $img.Dispose()
