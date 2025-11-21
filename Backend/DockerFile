FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

RUN ./mvnw -q -DskipTests package

COPY backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
