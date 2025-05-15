// app.ts - Archivo principal de TypeScript para Muro ISC A
/**
 * Clase principal de la aplicación Muro ISC A
 * Gestiona la creación, animación y ciclo de vida de mensajes flotantes
 */
var MuroApp = /** @class */ (function () {
    /**
     * Constructor - Inicializa la aplicación y configura los eventos
     */
    function MuroApp() {
        this.mensajes = [];
        this.animacionId = null;
        // Obtener referencias a elementos del DOM
        this.contenedor = document.getElementById('contenedor');
        this.formulario = document.getElementById('form-mensaje');
        this.inputMensaje = document.getElementById('input-mensaje');
        this.errorContainer = document.getElementById('error-container');
        // Inicializar eventos y animación
        this.inicializar();
    }
    /**
     * Configuración inicial de eventos y animación
     */
    MuroApp.prototype.inicializar = function () {
        var _this = this;
        // Manejar envío del formulario
        this.formulario.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.publicarMensaje();
        });
        // Iniciar bucle de animación
        this.iniciarAnimacion();
        // Manejar cambio de tamaño de ventana
        window.addEventListener('resize', function () {
            _this.ajustarPosicionesMensajes();
        });
    };
    /**
     * Genera un color HSL aleatorio vibrante
     */
    MuroApp.prototype.generarColorAleatorio = function () {
        var hue = Math.floor(Math.random() * 360);
        var saturation = Math.floor(Math.random() * 30) + 70; // Entre 70% y 100%
        var lightness = Math.floor(Math.random() * 30) + 45; // Entre 45% y 75%
        return "hsl(".concat(hue, ", ").concat(saturation, "%, ").concat(lightness, "%)");
    };
    /**
     * Determina si un color HSL es oscuro para elegir el color de texto adecuado
     */
    MuroApp.prototype.esColorOscuro = function (colorHSL) {
        var match = colorHSL.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match)
            return true;
        var lightness = parseInt(match[3]);
        return lightness < 50;
    };
    /**
     * Muestra un mensaje de error temporal
     */
    MuroApp.prototype.mostrarError = function (mensaje) {
        var _this = this;
        this.errorContainer.textContent = mensaje;
        this.errorContainer.style.display = 'block';
        setTimeout(function () {
            _this.errorContainer.style.display = 'none';
        }, 3000);
    };
    /**
     * Crea y publica un nuevo mensaje flotante
     */
    MuroApp.prototype.publicarMensaje = function () {
        var _this = this;
        var textoMensaje = this.inputMensaje.value.trim();
        if (!textoMensaje) {
            this.mostrarError('¡Por favor escribe un mensaje!');
            return;
        }
        var color = this.generarColorAleatorio();
        var colorTexto = this.esColorOscuro(color) ? 'white' : 'black';
        // Crear elemento del mensaje
        var mensajeElemento = document.createElement('div');
        mensajeElemento.className = 'mensaje-flotante';
        mensajeElemento.textContent = textoMensaje;
        mensajeElemento.style.backgroundColor = color;
        mensajeElemento.style.color = colorTexto;
        // Añadir al DOM
        this.contenedor.appendChild(mensajeElemento);
        // Calcular posición inicial aleatoria
        var anchoPantalla = window.innerWidth;
        var altoPantalla = window.innerHeight;
        var anchura = mensajeElemento.offsetWidth;
        var altura = mensajeElemento.offsetHeight;
        var posicionX = Math.random() * (anchoPantalla - anchura);
        var posicionY = Math.random() * (altoPantalla - altura - 100); // Evitar el panel de control
        // Configurar velocidad aleatoria
        var velocidadX = (Math.random() * 2 - 1) * 2;
        var velocidadY = (Math.random() * 2 - 1) * 2;
        // Crear objeto de mensaje
        var nuevoMensaje = {
            id: Date.now(),
            texto: textoMensaje,
            color: color,
            elemento: mensajeElemento,
            posicion: { x: posicionX, y: posicionY },
            velocidad: { x: velocidadX, y: velocidadY },
            opacidad: 1,
            anchura: anchura,
            altura: altura
        };
        // Aplicar posición inicial
        mensajeElemento.style.left = "".concat(posicionX, "px");
        mensajeElemento.style.top = "".concat(posicionY, "px");
        // Añadir a la lista de mensajes
        this.mensajes.push(nuevoMensaje);
        // Limpiar input
        this.inputMensaje.value = '';
        // Programar desaparición
        setTimeout(function () {
            _this.iniciarDesaparicion(nuevoMensaje);
        }, 30000);
    };
    /**
     * Inicia la desaparición gradual de un mensaje
     */
    MuroApp.prototype.iniciarDesaparicion = function (mensaje) {
        var _this = this;
        // Reducir opacidad gradualmente
        var duracionDesaparicion = 5000; // 5 segundos
        var intervaloActualizacion = 50; // 50ms
        var pasos = duracionDesaparicion / intervaloActualizacion;
        var decrementoOpacidad = mensaje.opacidad / pasos;
        var intervalId = setInterval(function () {
            mensaje.opacidad -= decrementoOpacidad;
            if (mensaje.opacidad <= 0) {
                mensaje.opacidad = 0;
                mensaje.elemento.style.display = 'none';
                clearInterval(intervalId);
                // Eliminar del DOM y de la lista
                setTimeout(function () {
                    if (mensaje.elemento.parentNode) {
                        mensaje.elemento.parentNode.removeChild(mensaje.elemento);
                    }
                    _this.mensajes = _this.mensajes.filter(function (m) { return m.id !== mensaje.id; });
                }, 100);
            }
            mensaje.elemento.style.opacity = mensaje.opacidad.toString();
        }, intervaloActualizacion);
    };
    /**
     * Inicia el bucle de animación para mover los mensajes
     */
    MuroApp.prototype.iniciarAnimacion = function () {
        var _this = this;
        var animarFrame = function () {
            _this.actualizarMensajes();
            _this.animacionId = requestAnimationFrame(animarFrame);
        };
        this.animacionId = requestAnimationFrame(animarFrame);
    };
    /**
     * Actualiza la posición de todos los mensajes en cada frame
     */
    MuroApp.prototype.actualizarMensajes = function () {
        var anchoPantalla = window.innerWidth;
        var altoPantalla = window.innerHeight;
        for (var _i = 0, _a = this.mensajes; _i < _a.length; _i++) {
            var mensaje = _a[_i];
            // Calcular nueva posición
            var nuevaX = mensaje.posicion.x + mensaje.velocidad.x;
            var nuevaY = mensaje.posicion.y + mensaje.velocidad.y;
            // Comprobar colisiones con los bordes
            if (nuevaX <= 0 || nuevaX + mensaje.anchura >= anchoPantalla) {
                mensaje.velocidad.x = -mensaje.velocidad.x;
                nuevaX = nuevaX <= 0 ? 0 : anchoPantalla - mensaje.anchura;
            }
            if (nuevaY <= 0 || nuevaY + mensaje.altura >= altoPantalla - 100) {
                mensaje.velocidad.y = -mensaje.velocidad.y;
                nuevaY = nuevaY <= 0 ? 0 : altoPantalla - mensaje.altura - 100;
            }
            // Actualizar posición
            mensaje.posicion.x = nuevaX;
            mensaje.posicion.y = nuevaY;
            // Aplicar al elemento
            mensaje.elemento.style.left = "".concat(nuevaX, "px");
            mensaje.elemento.style.top = "".concat(nuevaY, "px");
        }
    };
    /**
     * Ajusta las posiciones de los mensajes cuando cambia el tamaño de la ventana
     */
    MuroApp.prototype.ajustarPosicionesMensajes = function () {
        var anchoPantalla = window.innerWidth;
        var altoPantalla = window.innerHeight;
        for (var _i = 0, _a = this.mensajes; _i < _a.length; _i++) {
            var mensaje = _a[_i];
            // Asegurarse de que los mensajes no estén fuera de la pantalla
            if (mensaje.posicion.x + mensaje.anchura > anchoPantalla) {
                mensaje.posicion.x = anchoPantalla - mensaje.anchura;
            }
            if (mensaje.posicion.y + mensaje.altura > altoPantalla - 100) {
                mensaje.posicion.y = altoPantalla - mensaje.altura - 100;
            }
            // Aplicar al elemento
            mensaje.elemento.style.left = "".concat(mensaje.posicion.x, "px");
            mensaje.elemento.style.top = "".concat(mensaje.posicion.y, "px");
        }
    };
    return MuroApp;
}());
// Iniciar la aplicación cuando cargue el DOM
document.addEventListener('DOMContentLoaded', function () {
    new MuroApp();
});
