// Definición de interfaces
interface Message {
    text: string;
    author: 'su' | 'vic';
    id: number;
    timestamp: string;
}

// Clave para almacenar mensajes en localStorage
const LOCAL_STORAGE_KEY: string = 'personal-messages';

// Clase para manejar la lógica de mensajes
class MessageManager {
    private messages: Message[] = [];
    private messageContainer: HTMLElement;
    private messageText: HTMLTextAreaElement;
    private sendBtn: HTMLButtonElement;
    private clearBtn: HTMLButtonElement;
    private statusMessage: HTMLElement;

    constructor() {
        // Inicializar elementos del DOM
        this.messageContainer = document.getElementById('messageContainer') as HTMLElement;
        this.messageText = document.getElementById('messageText') as HTMLTextAreaElement;
        this.sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
        this.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
        this.statusMessage = document.getElementById('statusMessage') as HTMLElement;

        // Cargar mensajes
        this.loadMessages();

        // Configurar event listeners
        this.setupEventListeners();
    }

    // Función para guardar mensajes en localStorage
    private saveMessagesToLocalStorage(messages: Message[]): void {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    }

    // Función para cargar mensajes desde localStorage
    private loadMessagesFromLocalStorage(): Message[] {
        const savedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
        return savedMessages ? JSON.parse(savedMessages) : [];
    }

    // Función para mostrar un mensaje en pantalla
    private displayMessage(message: Message): void {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.author}`;
        messageElement.textContent = message.text;

        // Agregar timestamp si existe
        if (message.timestamp) {
            messageElement.title = new Date(message.timestamp).toLocaleString();
        }

        // Dimensiones del mensaje (estimadas)
        const messageWidth: number = 200;  // max-width del mensaje
        const messageHeight: number = 80;  // altura estimada

        // Límites del contenedor
        const containerWidth: number = this.messageContainer.clientWidth;
        const containerHeight: number = this.messageContainer.clientHeight;

        // Posición aleatoria inicial dentro de los límites seguros
        const randomX: number = Math.random() * (containerWidth - messageWidth);
        const randomY: number = Math.random() * (containerHeight - messageHeight);

        messageElement.style.left = `${randomX}px`;
        messageElement.style.top = `${randomY}px`;

        // Velocidades aleatorias (píxeles por segundo)
        const speedX: number = (Math.random() * 40) + 10;  // entre 10 y 50
        const speedY: number = (Math.random() * 40) + 10;  // entre 10 y 50

        // Direcciones iniciales aleatorias
        let directionX: number = Math.random() > 0.5 ? 1 : -1;
        let directionY: number = Math.random() > 0.5 ? 1 : -1;

        this.messageContainer.appendChild(messageElement);

        // Función de animación personalizada
        const animate = (): void => {
            // Obtener posición actual
            let currentX: number = parseFloat(messageElement.style.left);
            let currentY: number = parseFloat(messageElement.style.top);

            // Actualizar posición basada en velocidad y dirección
            currentX += directionX * speedX * 0.01;
            currentY += directionY * speedY * 0.01;

            // Comprobar colisiones con los bordes
            if (currentX <= 0) {
                currentX = 0;
                directionX = 1; // Cambiar dirección al chocar con borde izquierdo
            } else if (currentX >= containerWidth - messageWidth) {
                currentX = containerWidth - messageWidth;
                directionX = -1; // Cambiar dirección al chocar con borde derecho
            }

            if (currentY <= 0) {
                currentY = 0;
                directionY = 1; // Cambiar dirección al chocar con borde superior
            } else if (currentY >= containerHeight - messageHeight) {
                currentY = containerHeight - messageHeight;
                directionY = -1; // Cambiar dirección al chocar con borde inferior
            }

            // Aplicar nueva posición
            messageElement.style.left = `${currentX}px`;
            messageElement.style.top = `${currentY}px`;

            // Continuar animación
            requestAnimationFrame(animate);
        };

        // Iniciar animación
        animate();
    }

    // Función para cargar todos los mensajes
    public loadMessages(): void {
        // Limpiar contenedor de mensajes
        this.messageContainer.innerHTML = '';

        // Obtener mensajes de localStorage
        this.messages = this.loadMessagesFromLocalStorage();

        // Mostrar los mensajes en pantalla
        if (this.messages && this.messages.length > 0) {
            this.messages.forEach(message => {
                this.displayMessage(message);
            });
            this.showStatus(`${this.messages.length} mensajes cargados`, false);
        } else {
            this.showStatus('No hay mensajes todavía', false);
        }
    }

    // Función para guardar un nuevo mensaje
    private saveMessage(message: Message): boolean {
        // Añadir el nuevo mensaje
        this.messages.push(message);

        // Guardar en localStorage
        this.saveMessagesToLocalStorage(this.messages);

        // Mostrar mensaje en pantalla
        this.displayMessage(message);

        return true;
    }

    // Configurar event listeners
    private setupEventListeners(): void {
        // Evento para enviar mensaje
        this.sendBtn.addEventListener('click', () => {
            this.handleSendMessage();
        });

        // Evento para borrar todos los mensajes
        this.clearBtn.addEventListener('click', () => {
            this.handleClearMessages();
        });

        // Agregamos event listener para Enter en el textarea
        this.messageText.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Adaptación responsiva para los mensajes cuando cambia el tamaño de la ventana
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    // Manejador para enviar mensaje
    private handleSendMessage(): void {
        const text = this.messageText.value.trim();
        if (text) {
            // Deshabilitar el botón mientras se procesa
            this.sendBtn.disabled = true;
            this.showStatus('Enviando mensaje...', false);

            const authorElement = document.querySelector('input[name="author"]:checked') as HTMLInputElement;
            const author = authorElement.value as 'su' | 'vic';

            const message: Message = {
                text: text,
                author: author,
                id: Date.now(),
                timestamp: new Date().toISOString()
            };

            const success = this.saveMessage(message);

            if (success) {
                // Limpiar el campo de texto
                this.messageText.value = '';
                this.showStatus('¡Mensaje enviado con éxito!', false);
            } else {
                this.showStatus('Error al enviar el mensaje', true);
            }

            // Habilitar el botón nuevamente
            this.sendBtn.disabled = false;

            // Ocultar el mensaje de estado después de un tiempo
            setTimeout(() => {
                this.statusMessage.style.display = 'none';
            }, 3000);
        }
    }

    // Manejador para borrar todos los mensajes
    private handleClearMessages(): void {
        if (confirm('¿Estás seguro de que quieres borrar TODOS los mensajes?')) {
            // Limpiar mensajes de localStorage
            localStorage.removeItem(LOCAL_STORAGE_KEY);

            // Limpiar contenedor de mensajes
            this.messageContainer.innerHTML = '';

            // Resetear arreglo de mensajes
            this.messages = [];

            // Mostrar mensaje de estado
            this.showStatus('Todos los mensajes han sido borrados', false);
        }
    }

    // Manejador para el cambio de tamaño de la ventana
    private handleWindowResize(): void {
        // Actualizar límites del contenedor
        const containerWidth: number = this.messageContainer.clientWidth;
        const containerHeight: number = this.messageContainer.clientHeight;

        // Ajustar posición de mensajes existentes
        const messageElements = document.querySelectorAll('.message');
        messageElements.forEach(msg => {
            const messageWidth: number = 200;  // max-width del mensaje
            const messageHeight: number = 80;  // altura estimada

            let currentX: number = parseFloat((msg as HTMLElement).style.left);
            let currentY: number = parseFloat((msg as HTMLElement).style.top);

            // Asegurarse de que los mensajes estén dentro de los límites
            if (currentX > containerWidth - messageWidth) {
                (msg as HTMLElement).style.left = `${containerWidth - messageWidth}px`;
            }

            if (currentY > containerHeight - messageHeight) {
                (msg as HTMLElement).style.top = `${containerHeight - messageHeight}px`;
            }
        });
    }

    // Función para mostrar mensajes de estado
    private showStatus(message: string, isError: boolean): void {
        this.statusMessage.textContent = message;
        this.statusMessage.style.color = isError ? '#ff6b6b' : '#8aff8a';
        this.statusMessage.style.display = 'block';
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const messageManager = new MessageManager();
});