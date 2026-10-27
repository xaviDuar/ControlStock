# tools/preparar_logo.ps1
# Genera src/frontend/src/assets/logo.png a partir del logo del manual:
# recorta solo la taza (la region superior; el texto incrustado queda abajo),
# hace transparente el fondo blanco y colorea el trazo con el accent #4aaa8a.
Add-Type -AssemblyName System.Drawing

$cs = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class LogoPrep {
  public static string Run(string src, string dst, double regionFrac, int pad) {
    using (Bitmap bmp = new Bitmap(src)) {
      int w = bmp.Width, h = bmp.Height;
      int limitY = (int)(h * regionFrac);
      BitmapData data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      int stride = data.Stride;
      byte[] buf = new byte[stride * h];
      Marshal.Copy(data.Scan0, buf, 0, buf.Length);
      bmp.UnlockBits(data);

      int minX = w, minY = h, maxX = -1, maxY = -1;
      for (int y = 0; y < limitY; y++) {
        int row = y * stride;
        for (int x = 0; x < w; x++) {
          int i = row + x * 4;
          int lum = (int)(0.299 * buf[i + 2] + 0.587 * buf[i + 1] + 0.114 * buf[i]);
          if (lum < 128) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) throw new Exception("No se encontraron pixeles oscuros en la region superior");

      minX = Math.Max(0, minX - pad);
      minY = Math.Max(0, minY - pad);
      maxX = Math.Min(w - 1, maxX + pad);
      maxY = Math.Min(limitY - 1, maxY + pad);
      int cw = maxX - minX + 1, ch = maxY - minY + 1;

      using (Bitmap outBmp = new Bitmap(cw, ch, PixelFormat.Format32bppArgb)) {
        BitmapData od = outBmp.LockBits(new Rectangle(0, 0, cw, ch), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        byte[] ob = new byte[od.Stride * ch];
        for (int y = 0; y < ch; y++) {
          int srow = (minY + y) * stride + minX * 4;
          int orow = y * od.Stride;
          for (int x = 0; x < cw; x++) {
            int si = srow + x * 4;
            int oi = orow + x * 4;
            int lum = (int)(0.299 * buf[si + 2] + 0.587 * buf[si + 1] + 0.114 * buf[si]);
            ob[oi] = 0x8a;
            ob[oi + 1] = 0xaa;
            ob[oi + 2] = 0x4a;
            ob[oi + 3] = (byte)(lum > 200 ? 0 : 255 - lum);
          }
        }
        Marshal.Copy(ob, 0, od.Scan0, ob.Length);
        outBmp.UnlockBits(od);
        outBmp.Save(dst, ImageFormat.Png);
      }
      return cw + "x" + ch;
    }
  }
}
'@

Add-Type -TypeDefinition $cs -ReferencedAssemblies System.Drawing

$raiz = Split-Path -Parent $PSScriptRoot
$src = Join-Path $raiz "src\frontend\manual\Gemini_Generated_Image_1zovis1zovis1zov (1).jpg"
$dstDir = Join-Path $raiz "src\frontend\src\assets"
$dst = Join-Path $dstDir "logo.png"

if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir | Out-Null }
$tam = [LogoPrep]::Run($src, $dst, 0.65, 8)
Write-Output "logo.png generado: $tam -> $dst"
