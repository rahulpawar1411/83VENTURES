Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "assets\Abhilash_Amula_Website_Career_Profile.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $docxPath))
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$matches = [regex]::Matches($content, "<w:t[^>]*>(.*?)</w:t>")
$text = foreach ($m in $matches) { $m.Groups[1].Value }
$fullText = $text -join " "
Write-Output $fullText
