FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copiar archivos de Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src ./src

# Dar permisos y compilar
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Renombrar el JAR generado
RUN mv target/backend-*.jar app.jar

# Limpiar archivos innecesarios
RUN rm -rf target src .mvn mvnw pom.xml

# Exponer puerto
EXPOSE 8080

# Iniciar con perfil cloud activo
ENTRYPOINT ["java", "-Dspring.profiles.active=cloud", "-jar", "app.jar"]