#!/usr/bin/env python3
"""
🤖 Agente de IA para Demo Automatizado de AquaDelivery
=====================================================

Este script automatiza el recorrido completo por la aplicación
para crear un video promocional profesional.

Requisitos:
- pip install selenium webdriver-manager
- Chrome o Firefox instalado
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

class AquaDeliveryDemoAgent:
    def __init__(self, headless=False, window_size=(1920, 1080)):
        """
        Inicializa el agente de demo
        
        Args:
            headless (bool): Si True, ejecuta sin interfaz gráfica
            window_size (tuple): Tamaño de ventana (ancho, alto)
        """
        self.headless = headless
        self.window_size = window_size
        self.driver = None
        self.wait = None
        self.actions = None
        
    def setup_driver(self):
        """Configura el driver de Selenium"""
        print("🚀 Configurando driver de Selenium...")
        
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        
        chrome_options.add_argument(f"--window-size={self.window_size[0]},{self.window_size[1]}")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Instalar ChromeDriver automáticamente
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Configurar timeouts
        self.driver.implicitly_wait(10)
        self.wait = WebDriverWait(self.driver, 20)
        self.actions = ActionChains(self.driver)
        
        # Ocultar que es un bot
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        print("✅ Driver configurado correctamente")
    
    def smooth_scroll(self, element):
        """Scroll suave hacia un elemento"""
        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(0.5)
    
    def highlight_element(self, element, duration=1):
        """Resalta un elemento temporalmente"""
        original_style = element.get_attribute("style")
        self.driver.execute_script(
            "arguments[0].style.border='3px solid #ff6b6b'; arguments[0].style.boxShadow='0 0 10px #ff6b6b';",
            element
        )
        time.sleep(duration)
        self.driver.execute_script(f"arguments[0].style='{original_style}';", element)
    
    def demo_login(self):
        """Demo del proceso de login"""
        print("🔐 Iniciando demo de login...")
        
        # Ir a la página de login
        self.driver.get("http://localhost:4321/login")
        time.sleep(2)
        
        # Resaltar el logo
        logo = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "img[alt='AquaDelivery Logo']")))
        self.highlight_element(logo, 2)
        
        # Llenar credenciales de prueba
        password_input = self.wait.until(EC.presence_of_element_located((By.ID, "telegramId")))
        self.highlight_element(password_input, 1)
        password_input.clear()
        password_input.send_keys("test")
        time.sleep(0.5)
        
        company_input = self.driver.find_element(By.ID, "codigoEmpresa")
        self.highlight_element(company_input, 1)
        company_input.clear()
        company_input.send_keys("1")
        time.sleep(0.5)
        
        # Hacer clic en login
        login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        self.highlight_element(login_button, 1)
        login_button.click()
        
        # Esperar a que cargue el dashboard
        self.wait.until(EC.url_contains("/"))
        time.sleep(2)
        print("✅ Login completado")
    
    def demo_dashboard(self):
        """Demo del dashboard principal"""
        print("📊 Mostrando dashboard...")
        
        # Esperar a que cargue el dashboard
        time.sleep(2)
        
        # Resaltar elementos principales del dashboard
        try:
            # Buscar elementos típicos del dashboard
            dashboard_elements = [
                "nav",  # Navegación
                ".dashboard",  # Contenedor del dashboard
                "[data-section='pedidos']",  # Sección de pedidos
                "[data-section='clientes']",  # Sección de clientes
                "[data-section='productos']"  # Sección de productos
            ]
            
            for selector in dashboard_elements:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    self.smooth_scroll(element)
                    self.highlight_element(element, 1.5)
                except:
                    continue
                    
        except Exception as e:
            print(f"⚠️ Algunos elementos del dashboard no se encontraron: {e}")
        
        print("✅ Dashboard mostrado")
    
    def demo_clientes(self):
        """Demo de gestión de clientes"""
        print("👥 Demo de gestión de clientes...")
        
        # Hacer clic en la sección de clientes
        try:
            clientes_link = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-section='clientes'], a[href*='clientes'], button[onclick*='clientes']")))
            self.highlight_element(clientes_link, 1)
            clientes_link.click()
            time.sleep(2)
        except:
            print("⚠️ No se pudo encontrar el enlace de clientes")
            return
        
        # Mostrar funcionalidades de clientes
        try:
            # Buscar botón de agregar cliente
            add_button = self.driver.find_element(By.CSS_SELECTOR, "button[onclick*='agregar'], button[onclick*='nuevo'], .btn-primary")
            self.highlight_element(add_button, 2)
            
            # Mostrar lista de clientes
            clientes_list = self.driver.find_elements(By.CSS_SELECTOR, ".cliente-item, .client-row, tr")
            if clientes_list:
                self.highlight_element(clientes_list[0], 1.5)
                
        except Exception as e:
            print(f"⚠️ Algunas funcionalidades de clientes no se encontraron: {e}")
        
        print("✅ Demo de clientes completado")
    
    def demo_productos(self):
        """Demo de gestión de productos"""
        print("🛍️ Demo de gestión de productos...")
        
        # Navegar a productos
        try:
            productos_link = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-section='productos'], a[href*='productos'], button[onclick*='productos']")))
            self.highlight_element(productos_link, 1)
            productos_link.click()
            time.sleep(2)
        except:
            print("⚠️ No se pudo encontrar el enlace de productos")
            return
        
        # Mostrar funcionalidades de productos
        try:
            # Mostrar lista de productos
            productos_list = self.driver.find_elements(By.CSS_SELECTOR, ".producto-item, .product-row, tr")
            if productos_list:
                self.highlight_element(productos_list[0], 1.5)
                
            # Buscar botón de agregar producto
            add_button = self.driver.find_element(By.CSS_SELECTOR, "button[onclick*='agregar'], button[onclick*='nuevo'], .btn-primary")
            self.highlight_element(add_button, 2)
                
        except Exception as e:
            print(f"⚠️ Algunas funcionalidades de productos no se encontraron: {e}")
        
        print("✅ Demo de productos completado")
    
    def demo_pedidos(self):
        """Demo de gestión de pedidos"""
        print("📦 Demo de gestión de pedidos...")
        
        # Navegar a pedidos
        try:
            pedidos_link = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-section='pedidos'], a[href*='pedidos'], button[onclick*='pedidos']")))
            self.highlight_element(pedidos_link, 1)
            pedidos_link.click()
            time.sleep(2)
        except:
            print("⚠️ No se pudo encontrar el enlace de pedidos")
            return
        
        # Mostrar funcionalidades de pedidos
        try:
            # Mostrar lista de pedidos
            pedidos_list = self.driver.find_elements(By.CSS_SELECTOR, ".pedido-item, .pedido-row, tr")
            if pedidos_list:
                self.highlight_element(pedidos_list[0], 1.5)
                
            # Buscar botón de nuevo pedido
            add_button = self.driver.find_element(By.CSS_SELECTOR, "button[onclick*='nuevo'], button[onclick*='agregar'], .btn-primary")
            self.highlight_element(add_button, 2)
                
        except Exception as e:
            print(f"⚠️ Algunas funcionalidades de pedidos no se encontraron: {e}")
        
        print("✅ Demo de pedidos completado")
    
    def demo_responsive(self):
        """Demo del diseño responsive"""
        print("📱 Demo de diseño responsive...")
        
        # Cambiar a tamaño móvil
        self.driver.set_window_size(375, 667)  # iPhone SE
        time.sleep(1)
        
        # Mostrar que funciona en móvil
        try:
            # Buscar elementos que se adaptan
            nav_elements = self.driver.find_elements(By.CSS_SELECTOR, "nav, .navbar, .menu")
            if nav_elements:
                self.highlight_element(nav_elements[0], 2)
        except:
            pass
        
        # Volver a tamaño desktop
        self.driver.set_window_size(*self.window_size)
        time.sleep(1)
        
        print("✅ Demo responsive completado")
    
    def run_complete_demo(self):
        """Ejecuta el demo completo"""
        print("🎬 Iniciando demo completo de AquaDelivery...")
        
        try:
            self.setup_driver()
            
            # Secuencia del demo
            self.demo_login()
            self.demo_dashboard()
            self.demo_clientes()
            self.demo_productos()
            self.demo_pedidos()
            self.demo_responsive()
            
            print("🎉 Demo completado exitosamente!")
            
        except Exception as e:
            print(f"❌ Error durante el demo: {e}")
            
        finally:
            if self.driver:
                print("🔄 Cerrando navegador...")
                self.driver.quit()
    
    def run_demo_with_recording(self, output_file="demo_recording.mp4"):
        """Ejecuta el demo y graba la pantalla"""
        print(f"🎥 Iniciando demo con grabación: {output_file}")
        
        # Nota: Para grabación de pantalla necesitarías integrar con ffmpeg
        # o usar herramientas como OBS Studio
        self.run_complete_demo()
        
        print("💡 Para grabar el video, ejecuta este script mientras grabas con OBS Studio")

def main():
    """Función principal"""
    print("🤖 Agente de Demo de AquaDelivery")
    print("=" * 40)
    
    # Crear y ejecutar el agente
    agent = AquaDeliveryDemoAgent(headless=False, window_size=(1920, 1080))
    
    # Ejecutar demo completo
    agent.run_complete_demo()

if __name__ == "__main__":
    main()




