FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY Backend/mvnw .
COPY Backend/.mvn .mvn

COPY Backend/pom.xml .
COPY Backend/src ./src

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests package

RUN cp target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
