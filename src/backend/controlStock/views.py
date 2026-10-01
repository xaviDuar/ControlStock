from django.conf import settings
from django.http import FileResponse
from django.shortcuts import render


def spa(request, path=''):
    """Sirve el index.html del build de Vite para cualquier ruta no-API."""
    return render(request, 'index.html')


def favicon(request):
    return FileResponse(
        str(settings.FRONTEND_DIST / 'favicon.svg'),
        content_type='image/svg+xml',
    )