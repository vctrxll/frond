// app.ts - Archivo principal de TypeScript para Muro ISC A

// Definir interfaces
interface Posicion {
    x: number;
    y: number;
}

interface Velocidad {
    x: number;
    y: number;
}

interface Mensaje {
    id: number;
    texto: string;
    color: string;
    elemento: HTMLDivElement;
    posicion: Posicion;
    velocidad: Velocidad;
    opacidad: number;
    anchura: number;
    altura: number;
}

/**
 * Clase principal de la aplicación Muro ISC A
 * Gestiona la creación, animación y ciclo de vida de mensajes flotantes
 */
class MuroApp {
    private mensajes: Mensaje[] = [];
    private contenedor: HTMLElement;
    private formulario: HTMLFormElement;
    private inputMensaje: HTMLInputElement;
    private errorContainer: HTMLElement;
    private animacionId: number | null = null;

    /**
     * Constructor - Inicializa la aplicación y configura los eventos
     */
    constructor() {
        // Obtener referencias a elementos del DOM
        this.contenedor = document.getElementById('contenedor') as HTMLElement;
        this.formulario = document.getElementById('form-mensaje') as HTMLFormElement;
        this.inputMensaje = document.getElementById('input-mensaje') as HTMLInputElement;
        this.errorContainer = document.getElementById('error-container') as HTMLElement;

        // Inicializar eventos y animación
        this.inicializar();
    }

    /**
     * Configuración inicial de eventos y animación
     */
    private inicializar(): void {
        // Manejar envío del formulario
        this.formulario.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.publicarMensaje();
        });

        // Iniciar bucle de animación
        this.iniciarAnimacion();

        // Manejar cambio de tamaño de ventana
        window.addEventListener('resize', () => {
            this.ajustarPosicionesMensajes();
        });
    }

    /**
     * Genera un color HSL aleatorio vibrante
     */
    private generarColorAleatorio(): string {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 30) + 70; // Entre 70% y 100%
        const lightness = Math.floor(Math.random() * 30) + 45; // Entre 45% y 75%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Determina si un color HSL es oscuro para elegir el color de texto adecuado
     */
    private esColorOscuro(colorHSL: string): boolean {
        const match = colorHSL.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) return true;

        const lightness = parseInt(match[3]);
        return lightness < 50;
    }

    /**
     * Muestra un mensaje de error temporal
     */
    private mostrarError(mensaje: string): void {
        this.errorContainer.textContent = mensaje;
        this.errorContainer.style.display = 'block';

        setTimeout(() => {
            this.errorContainer.style.display = 'none';
        }, 3000);
    }

    /**
     * Crea y publica un nuevo mensaje flotante
     */
    private publicarMensaje(): void {
        const textoMensaje = this.inputMensaje.value.trim();

        if (!textoMensaje) {
            this.mostrarError('¡Por favor escribe un mensaje!');
            return;
        }

        const color = this.generarColorAleatorio();
        const colorTexto = this.esColorOscuro(color) ? 'white' : 'black';

        // Crear elemento del mensaje
        const mensajeElemento = document.createElement('div');
        mensajeElemento.className = 'mensaje-flotante';
        mensajeElemento.textContent = textoMensaje;
        mensajeElemento.style.backgroundColor = color;
        mensajeElemento.style.color = colorTexto;

        // Añadir al DOM
        this.contenedor.appendChild(mensajeElemento);

        // Calcular posición inicial aleatoria
        const anchoPantalla = window.innerWidth;
        const altoPantalla = window.innerHeight;
        const anchura = mensajeElemento.offsetWidth;
        const altura = mensajeElemento.offsetHeight;

        const posicionX = Math.random() * (anchoPantalla - anchura);
        const posicionY = Math.random() * (altoPantalla - altura - 100); // Evitar el panel de control

        // Configurar velocidad aleatoria
        const velocidadX = (Math.random() * 2 - 1) * 2;
        const velocidadY = (Math.random() * 2 - 1) * 2;

        // Crear objeto de mensaje
        const nuevoMensaje: Mensaje = {
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
        mensajeElemento.style.left = `${posicionX}px`;
        mensajeElemento.style.top = `${posicionY}px`;

        // Añadir a la lista de mensajes
        this.mensajes.push(nuevoMensaje);

        // Limpiar input
        this.inputMensaje.value = '';

        // Programar desaparición
        setTimeout(() => {
            this.iniciarDesaparicion(nuevoMensaje);
        }, 30000);
    }

    /**
     * Inicia la desaparición gradual de un mensaje
     */
    private iniciarDesaparicion(mensaje: Mensaje): void {
        // Reducir opacidad gradualmente
        const duracionDesaparicion = 5000; // 5 segundos
        const intervaloActualizacion = 50; // 50ms
        const pasos = duracionDesaparicion / intervaloActualizacion;
        const decrementoOpacidad = mensaje.opacidad / pasos;

        const intervalId = setInterval(() => {
            mensaje.opacidad -= decrementoOpacidad;

            if (mensaje.opacidad <= 0) {
                mensaje.opacidad = 0;
                mensaje.elemento.style.display = 'none';
                clearInterval(intervalId);

                // Eliminar del DOM y de la lista
                setTimeout(() => {
                    if (mensaje.elemento.parentNode) {
                        mensaje.elemento.parentNode.removeChild(mensaje.elemento);
                    }
                    this.mensajes = this.mensajes.filter(m => m.id !== mensaje.id);
                }, 100);
            }

            mensaje.elemento.style.opacity = mensaje.opacidad.toString();
        }, intervaloActualizacion);
    }

    /**
     * Inicia el bucle de animación para mover los mensajes
     */
    private iniciarAnimacion(): void {
        const animarFrame = () => {
            this.actualizarMensajes();
            this.animacionId = requestAnimationFrame(animarFrame);
        };

        this.animacionId = requestAnimationFrame(animarFrame);
    }

    /**
     * Actualiza la posición de todos los mensajes en cada frame
     */
    private actualizarMensajes(): void {
        const anchoPantalla = window.innerWidth;
        const altoPantalla = window.innerHeight;

        for (const mensaje of this.mensajes) {
            // Calcular nueva posición
            let nuevaX = mensaje.posicion.x + mensaje.velocidad.x;
            let nuevaY = mensaje.posicion.y + mensaje.velocidad.y;

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
            mensaje.elemento.style.left = `${nuevaX}px`;
            mensaje.elemento.style.top = `${nuevaY}px`;
        }
    }

    /**
     * Ajusta las posiciones de los mensajes cuando cambia el tamaño de la ventana
     */
    private ajustarPosicionesMensajes(): void {
        const anchoPantalla = window.innerWidth;
        const altoPantalla = window.innerHeight;

        for (const mensaje of this.mensajes) {
            // Asegurarse de que los mensajes no estén fuera de la pantalla
            if (mensaje.posicion.x + mensaje.anchura > anchoPantalla) {
                mensaje.posicion.x = anchoPantalla - mensaje.anchura;
            }

            if (mensaje.posicion.y + mensaje.altura > altoPantalla - 100) {
                mensaje.posicion.y = altoPantalla - mensaje.altura - 100;
            }

            // Aplicar al elemento
            mensaje.elemento.style.left = `${mensaje.posicion.x}px`;
            mensaje.elemento.style.top = `${mensaje.posicion.y}px`;
        }
    }
}

// Iniciar la aplicación cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    new MuroApp();
});