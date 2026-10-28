param([string]$Path = "design/footer.png")
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Resolve-Path $Path).Path)
$bmp = New-Object System.Drawing.Bitmap($img)
$W = $bmp.Width; $H = $bmp.Height

function Hex($c) { "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B }
Write-Output "== exact samples =="
foreach ($p in @(@(10,10),@(900,50),@(100,300),@(1750,300),@(900,500),@(300,650),@(1000,660),@(1740,690))) {
  Write-Output ("  ({0},{1}) = {2}" -f $p[0], $p[1], (Hex $bmp.GetPixel($p[0],$p[1])))
}

Write-Output ""
Write-Output "== color histogram (exact, every 2px) =="
$hist = @{}
for ($y=0; $y -lt $H; $y+=2) { for ($x=0; $x -lt $W; $x+=2) {
  $k = Hex $bmp.GetPixel($x,$y)
  if ($hist.ContainsKey($k)) { $hist[$k]++ } else { $hist[$k]=1 }
} }
$tot = ($hist.Values | Measure-Object -Sum).Sum
$hist.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10 | ForEach-Object {
  Write-Output ("  {0}  {1,7:0.000}%  count={2}" -f $_.Key, (100*$_.Value/$tot), $_.Value)
}

# background = most common color
$bg = ($hist.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key
Write-Output ""
Write-Output "== non-background content bounds per region =="
$bgc = [System.Drawing.ColorTranslator]::FromHtml($bg)

function ContentBounds($x0,$x1,$y0,$y1,$thresh) {
  $minX=99999; $maxX=-1; $minY=99999; $maxY=-1; $cnt=0
  for ($y=$y0; $y -lt $y1; $y++) { for ($x=$x0; $x -lt $x1; $x++) {
    $c = $bmp.GetPixel($x,$y)
    $d = [math]::Abs($c.R-$bgc.R)+[math]::Abs($c.G-$bgc.G)+[math]::Abs($c.B-$bgc.B)
    if ($d -gt $thresh) { $cnt++; if($x -lt $minX){$minX=$x}; if($x -gt $maxX){$maxX=$x}; if($y -lt $minY){$minY=$y}; if($y -gt $maxY){$maxY=$y} }
  } }
  "  region x[$x0..$x1] y[$y0..$y1]: count=$cnt  bbox=$minX,$minY -> $maxX,$maxY"
}
ContentBounds 0 430 0 $H 20
ContentBounds 430 $W 0 200 20
ContentBounds 430 $W 200 400 20
ContentBounds 430 $W 400 500 20
ContentBounds 0 $W 560 $H 20

Write-Output ""
Write-Output "== column profile of non-bg pixels (bands of 20px) =="
for ($x=0; $x -lt $W; $x+=20) {
  $cnt=0
  for ($y=0; $y -lt $H; $y+=2) { for ($xx=$x; $xx -lt [math]::Min($x+20,$W); $xx+=2) {
    $c=$bmp.GetPixel($xx,$y)
    $d=[math]::Abs($c.R-$bgc.R)+[math]::Abs($c.G-$bgc.G)+[math]::Abs($c.B-$bgc.B)
    if ($d -gt 40) { $cnt++ }
  }}
  $bar = "#" * [int]([math]::Min(60, $cnt/12))
  Write-Output ("{0,5} {1,5} {2}" -f $x, $cnt, $bar)
}
$bmp.Dispose(); $img.Dispose()
