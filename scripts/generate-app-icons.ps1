Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\ff1bba89-ab59-451d-a521-11e22acda3e2\.user_uploaded\media_1792196234005.jpg"
$publicDir = "c:\Users\Admin\Desktop\MindSparQ\MindSparQ_Coding\Project\mindsparq-official-website\public"
$imagesDir = Join-Path $publicDir "images"

if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
}

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output "Source Image Loaded: $($srcBmp.Width) x $($srcBmp.Height)"

# The squircle bounding box is roughly [Left: 96, Top: 108, Width: 832, Height: 832]
$cropRect = New-Object System.Drawing.Rectangle(96, 108, 832, 832)
$cropped = New-Object System.Drawing.Bitmap(832, 832, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gCrop = [System.Drawing.Graphics]::FromImage($cropped)
$gCrop.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gCrop.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gCrop.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gCrop.DrawImage($srcBmp, (New-Object System.Drawing.Rectangle(0, 0, 832, 832)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()

# Create rounded squircle mask with corner radius = 175 px
$masked = New-Object System.Drawing.Bitmap(832, 832, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gMasked = [System.Drawing.Graphics]::FromImage($masked)
$gMasked.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gMasked.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 175
$d = $r * 2
$w = 832
$h = 832
$path.AddArc(0, 0, $d, $d, 180, 90)
$path.AddArc($w - $d, 0, $d, $d, 270, 90)
$path.AddArc($w - $d, $h - $d, $d, $d, 0, 90)
$path.AddArc(0, $h - $d, $d, $d, 90, 90)
$path.CloseFigure()

$gMasked.SetClip($path)
$gMasked.DrawImage($cropped, 0, 0, 832, 832)
$gMasked.Dispose()

function Save-Resized($sourceBmp, $width, $height, $outPath, $format) {
    $target = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($sourceBmp, 0, 0, $width, $height)
    $g.Dispose()
    $target.Save($outPath, $format)
    $target.Dispose()
    Write-Output "Generated: $outPath ($width x $height)"
}

# 1. 512x512 Master PWA icon
Save-Resized $masked 512 512 (Join-Path $publicDir "icon-512.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 2. 192x192 PWA icon
Save-Resized $masked 192 192 (Join-Path $publicDir "icon-192.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 3. 180x180 Apple Touch Icon (on solid #0D172A brand background for iOS Safari)
$appleTouch = New-Object System.Drawing.Bitmap(180, 180, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gApple = [System.Drawing.Graphics]::FromImage($appleTouch)
$gApple.Clear([System.Drawing.ColorTranslator]::FromHtml("#0D172A"))
$gApple.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gApple.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gApple.DrawImage($masked, 0, 0, 180, 180)
$gApple.Dispose()
$appleTouch.Save((Join-Path $publicDir "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$appleTouch.Dispose()
Write-Output "Generated: apple-touch-icon.png (180x180)"

# 4. 32x32 Favicon PNG
Save-Resized $masked 32 32 (Join-Path $publicDir "favicon-32x32.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 5. 16x16 Favicon PNG
Save-Resized $masked 16 16 (Join-Path $publicDir "favicon-16x16.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 6. 512x512 Maskable PWA Icon (with safe-zone margin on solid brand navy)
$maskable = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gMask = [System.Drawing.Graphics]::FromImage($maskable)
$gMask.Clear([System.Drawing.ColorTranslator]::FromHtml("#0D172A"))
$gMask.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gMask.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gMask.DrawImage($masked, 51, 51, 410, 410)
$gMask.Dispose()
$maskable.Save((Join-Path $publicDir "icon-maskable.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$maskable.Dispose()
Write-Output "Generated: icon-maskable.png (512x512 with safe padding)"

# 7. Generate favicon.ico (Standard 32x32 Windows/Browser Icon)
$icoPath = Join-Path $publicDir "favicon.ico"
$png32 = [System.IO.File]::ReadAllBytes((Join-Path $publicDir "favicon-32x32.png"))
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]1)
$bw.Write([byte]32)
$bw.Write([byte]32)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$png32.Length)
$bw.Write([uint32]22)
$bw.Write($png32)
$bw.Flush()
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Dispose()
$ms.Dispose()
Write-Output "Generated: favicon.ico (Standard 32x32 Windows/Browser Icon)"

# 8. OpenGraph / Twitter Social Card (1200 x 630 px)
$ogBmp = New-Object System.Drawing.Bitmap(1200, 630, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gOg = [System.Drawing.Graphics]::FromImage($ogBmp)
$gOg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gOg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gOg.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(1200, 630)),
    ([System.Drawing.ColorTranslator]::FromHtml("#070E1A")),
    ([System.Drawing.ColorTranslator]::FromHtml("#14213D"))
)
$gOg.FillRectangle($bgBrush, 0, 0, 1200, 630)
$bgBrush.Dispose()

$glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 36, 87, 214))
$gOg.FillEllipse($glowBrush, 80, 85, 460, 460)
$glowBrush.Dispose()

$gOg.DrawImage($masked, 110, 115, 400, 400)

$fontFamily = New-Object System.Drawing.FontFamily("Arial")
$titleFont = New-Object System.Drawing.Font($fontFamily, 44, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font($fontFamily, 20, [System.Drawing.FontStyle]::Regular)
$tagFont = New-Object System.Drawing.Font($fontFamily, 13, [System.Drawing.FontStyle]::Bold)

# Eyebrow badge
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#2457D6"))
$badgeRect = New-Object System.Drawing.Rectangle(560, 120, 380, 34)
$gOg.FillRectangle($badgeBrush, $badgeRect)
$badgeBrush.Dispose()

$badgeTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gOg.DrawString("EMPOWERING MINDS, SPARKING INNOVATION", $tagFont, $badgeTextBrush, 570, 128)
$badgeTextBrush.Dispose()

# Main Title
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gOg.DrawString("MindSparQ", $titleFont, $whiteBrush, 555, 175)

$amberBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#F4B544"))
$gOg.DrawString("Education & Technology", (New-Object System.Drawing.Font($fontFamily, 30, [System.Drawing.FontStyle]::Bold)), $amberBrush, 558, 235)
$amberBrush.Dispose()

# Subtitle / Programs
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#94A3B8"))
$desc = "Pioneering STEM & Cognitive Training in Nepal:`r`n* Abacus & Mental Arithmetic`r`n* AI, Coding & Robotics Education`r`n* Vedic Mathematics & Brain Development"
$gOg.DrawString($desc, $subFont, $mutedBrush, 558, 300)
$mutedBrush.Dispose()

# Bottom Location footer
$tealBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0F9D91"))
$gOg.DrawString("Location: Butwal-11, Rupandehi, Nepal  |  mindsparqeducation.com.np", (New-Object System.Drawing.Font($fontFamily, 15, [System.Drawing.FontStyle]::Regular)), $tealBrush, 558, 480)
$tealBrush.Dispose()

$whiteBrush.Dispose()
$titleFont.Dispose()
$subFont.Dispose()
$tagFont.Dispose()
$fontFamily.Dispose()
$gOg.Dispose()

$ogPath = Join-Path $imagesDir "og-mindsparq.png"
$ogBmp.Save($ogPath, [System.Drawing.Imaging.ImageFormat]::Png)
$ogBmp.Dispose()
Write-Output "Generated: images/og-mindsparq.png (1200x630 Social Card)"

$cropped.Dispose()
$masked.Dispose()
$srcBmp.Dispose()
Write-Output "All enterprise app icon assets generated successfully!"
