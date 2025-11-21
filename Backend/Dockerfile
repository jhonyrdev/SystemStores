FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copiar Maven Wrapper para poder construir
COPY Backend/mvnw .
COPY Backend/.mvn .mvn

# Copiar pom.xml
COPY Backend/pom.xml .

# Copiar el código fuente
COPY Backend/src ./src

# Dar permisos al mvnw
RUN chmod +x mvnw

# Compilar el proyecto
RUN ./mvnw -q -DskipTests package

# Copiar el jar generado
RUN cp target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
