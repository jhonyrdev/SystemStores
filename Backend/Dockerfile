FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copiar archivos de Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Descargar dependencias (esto se cachea si el pom.xml no cambia)
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copiar código fuente
COPY src ./src

# Compilar aplicación
RUN ./mvnw clean package -DskipTests

# Renombrar el JAR generado
RUN mv target/backend-*.jar app.jar

# Limpiar archivos innecesarios
RUN rm -rf target src .mvn mvnw pom.xml

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=cloud

ENTRYPOINT ["java", "-jar", "app.jar"]