package org.shivang.inboxapplication.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.shivang.inboxapplication.dto.FolderRequestDto;
import org.shivang.inboxapplication.model.Folder;
import org.shivang.inboxapplication.service.FolderService;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class FolderControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FolderService folderService;

    @InjectMocks
    private FolderController folderController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private OAuth2User principal;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(folderController)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.hasParameterAnnotation(org.springframework.security.core.annotation.AuthenticationPrincipal.class);
                    }

                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return principal;
                    }
                })
                .build();
    }

    @Test
    public void addFolder_unauthorized_returns401() throws Exception {
        principal = null;
        FolderRequestDto dto = new FolderRequestDto("Work", "blue");
        mockMvc.perform(post("/api/folders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void addFolder_validRequest_returnsCreatedFolder() throws Exception {
        principal = mock(OAuth2User.class);
        when(principal.getAttribute("login")).thenReturn("testuser");

        FolderRequestDto dto = new FolderRequestDto("Work", "blue");
        Folder mockSavedFolder = new Folder("testuser", "Work", "blue");

        when(folderService.folderExists("testuser", "Work")).thenReturn(false);
        when(folderService.addFolder("testuser", "Work", "blue")).thenReturn(mockSavedFolder);

        mockMvc.perform(post("/api/folders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Work"))
                .andExpect(jsonPath("$.color").value("blue"));
    }

    @Test
    public void addFolder_emptyName_returns400() throws Exception {
        principal = mock(OAuth2User.class);
        when(principal.getAttribute("login")).thenReturn("testuser");

        FolderRequestDto dto = new FolderRequestDto("", "blue");

        mockMvc.perform(post("/api/folders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void addFolder_duplicateName_returns400() throws Exception {
        principal = mock(OAuth2User.class);
        when(principal.getAttribute("login")).thenReturn("testuser");

        FolderRequestDto dto = new FolderRequestDto("Work", "blue");

        when(folderService.folderExists("testuser", "Work")).thenReturn(true);

        mockMvc.perform(post("/api/folders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void addFolder_nullColor_defaultsToBlue() throws Exception {
        principal = mock(OAuth2User.class);
        when(principal.getAttribute("login")).thenReturn("testuser");

        FolderRequestDto dto = new FolderRequestDto("Work", null);
        Folder mockSavedFolder = new Folder("testuser", "Work", "blue");

        when(folderService.folderExists("testuser", "Work")).thenReturn(false);
        when(folderService.addFolder("testuser", "Work", "blue")).thenReturn(mockSavedFolder);

        mockMvc.perform(post("/api/folders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Work"))
                .andExpect(jsonPath("$.color").value("blue"));
    }
}
